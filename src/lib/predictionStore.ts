import type { Game } from "@/lib/oddsmaker";

export const GAME_PREDS_KEY = "oddsmaker_game_preds_v1";
export const LEGACY_PREDS_KEY = "oddsmaker_preds";
const SEASON = 2026;

export interface StoredGamePrediction {
  firstTeam: string;
  secondTeam: string;
  pctForFirstTeam: string;
}

export type GamePredictionStore = Record<string, StoredGamePrediction>;

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function orderedTeams(team: string, opponent: string): [string, string] {
  const sorted = [team, opponent].sort((a, b) => a.localeCompare(b));
  return [sorted[0], sorted[1]];
}

function getIdForTeams(team: string, opponent: string): string {
  const [firstTeam, secondTeam] = orderedTeams(team, opponent);
  return [
    SEASON,
    encodeURIComponent(firstTeam),
    encodeURIComponent(secondTeam),
  ].join(":");
}

export function getGameId(team: string, game: Game): string {
  return getIdForTeams(team, game.opponent);
}

function complement(value: string): string {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return "";
  return Number((100 - number).toFixed(2)).toString();
}

function matchesTeams(
  prediction: StoredGamePrediction,
  team: string,
  opponent: string
): boolean {
  const [firstTeam, secondTeam] = orderedTeams(team, opponent);
  return (
    prediction.firstTeam === firstTeam &&
    prediction.secondTeam === secondTeam
  );
}

function findPrediction(
  store: GamePredictionStore,
  team: string,
  game: Game
): StoredGamePrediction | undefined {
  return (
    store[getGameId(team, game)] ||
    Object.values(store).find((prediction) =>
      matchesTeams(prediction, team, game.opponent)
    )
  );
}

export function getTeamGamePrediction(
  store: GamePredictionStore,
  team: string,
  game: Game
): string {
  const prediction = findPrediction(store, team, game);
  if (!prediction) return "";
  return prediction.firstTeam === team
    ? prediction.pctForFirstTeam
    : complement(prediction.pctForFirstTeam);
}

export function setTeamGamePrediction(
  store: GamePredictionStore,
  team: string,
  game: Game,
  value: string
): GamePredictionStore {
  const id = getGameId(team, game);
  const next = Object.fromEntries(
    Object.entries(store).filter(
      ([, prediction]) => !matchesTeams(prediction, team, game.opponent)
    )
  ) as GamePredictionStore;

  if (value === "") return next;

  const [firstTeam, secondTeam] = orderedTeams(team, game.opponent);
  next[id] = {
    firstTeam,
    secondTeam,
    pctForFirstTeam: firstTeam === team ? value : complement(value),
  };
  return next;
}

function readJson<T>(storage: StorageLike, key: string, fallback: T): T {
  try {
    return JSON.parse(storage.getItem(key) || "") as T;
  } catch {
    return fallback;
  }
}

export function loadPredictionStore(storage: StorageLike): GamePredictionStore {
  const saved = readJson<GamePredictionStore>(storage, GAME_PREDS_KEY, {});
  const normalized: GamePredictionStore = {};

  Object.values(saved).forEach((prediction) => {
    if (
      !prediction?.firstTeam ||
      !prediction?.secondTeam ||
      prediction.pctForFirstTeam === undefined
    ) {
      return;
    }

    const id = getIdForTeams(prediction.firstTeam, prediction.secondTeam);
    if (!normalized[id]) normalized[id] = prediction;
  });

  if (JSON.stringify(saved) !== JSON.stringify(normalized)) {
    storage.setItem(GAME_PREDS_KEY, JSON.stringify(normalized));
  }

  return normalized;
}

export function loadTeamPredictions(
  storage: StorageLike,
  team: string,
  schedule: Game[]
): Record<number, string> {
  let store = loadPredictionStore(storage);
  const legacy = readJson<Record<string, Record<number, string>>>(
    storage,
    LEGACY_PREDS_KEY,
    {}
  );
  let migrated = false;
  const predictions: Record<number, string> = {};

  schedule.forEach((game, index) => {
    const sharedValue = getTeamGamePrediction(store, team, game);
    if (sharedValue !== "") {
      predictions[index] = sharedValue;
      return;
    }

    const legacyValue = legacy[team]?.[index];
    if (legacyValue !== undefined && legacyValue !== "") {
      predictions[index] = legacyValue;
      store = setTeamGamePrediction(store, team, game, legacyValue);
      migrated = true;
    }
  });

  if (migrated) {
    storage.setItem(GAME_PREDS_KEY, JSON.stringify(store));
  }

  return predictions;
}

export function saveTeamGamePrediction(
  storage: StorageLike,
  team: string,
  game: Game,
  value: string
): void {
  const next = setTeamGamePrediction(
    loadPredictionStore(storage),
    team,
    game,
    value
  );
  storage.setItem(GAME_PREDS_KEY, JSON.stringify(next));
}
