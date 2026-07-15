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

function normalizedDate(date: string): string {
  return date.trim().toUpperCase().split(/\s+/).slice(-2).join("-");
}

function orderedTeams(team: string, opponent: string): [string, string] {
  return [team, opponent].sort((a, b) => a.localeCompare(b));
}

export function getGameId(team: string, game: Game): string {
  const [firstTeam, secondTeam] = orderedTeams(team, game.opponent);
  return [
    SEASON,
    normalizedDate(game.date),
    encodeURIComponent(firstTeam),
    encodeURIComponent(secondTeam),
  ].join(":");
}

function complement(value: string): string {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return "";
  return Number((100 - number).toFixed(2)).toString();
}

export function getTeamGamePrediction(
  store: GamePredictionStore,
  team: string,
  game: Game
): string {
  const prediction = store[getGameId(team, game)];
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
  const next = { ...store };

  if (value === "") {
    delete next[id];
    return next;
  }

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
  return readJson<GamePredictionStore>(storage, GAME_PREDS_KEY, {});
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
  const next = setTeamGamePrediction(loadPredictionStore(storage), team, game, value);
  storage.setItem(GAME_PREDS_KEY, JSON.stringify(next));
}
