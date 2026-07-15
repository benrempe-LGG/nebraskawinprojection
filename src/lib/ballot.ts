import {
  ALL_TEAMS,
  getProjectedWinner,
  type Game,
} from "@/lib/oddsmaker";
import {
  getGameId,
  getTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";

export const LOCKED_BALLOTS_KEY = "oddsmaker_locked_ballots_v1";

export interface BallotProgress {
  totalGames: number;
  pickedGames: number;
  decidedGames: number;
  remainingGames: number;
  undecidedGames: number;
  canLock: boolean;
}

export interface SeasonGame {
  id: string;
  team: string;
  game: Game;
}

export interface LockedBallot {
  id: string;
  season: 2026;
  lockedAt: string;
  predictions: GamePredictionStore;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getSeasonGames(): SeasonGame[] {
  const games = new Map<string, SeasonGame>();

  for (const [team, info] of Object.entries(ALL_TEAMS)) {
    info.schedule.forEach((game) => {
      const id = getGameId(team, game);
      if (!games.has(id)) games.set(id, { id, team, game });
    });
  }

  return [...games.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function getSeasonGameIds(): string[] {
  return getSeasonGames().map((game) => game.id);
}

export function getBallotProgress(
  predictions: GamePredictionStore
): BallotProgress {
  const games = getSeasonGames();
  let pickedGames = 0;
  let decidedGames = 0;

  games.forEach(({ team, game }) => {
    const value = getTeamGamePrediction(predictions, team, game);
    if (value === "") return;

    pickedGames += 1;
    if (getProjectedWinner(team, game, value)) decidedGames += 1;
  });

  return {
    totalGames: games.length,
    pickedGames,
    decidedGames,
    remainingGames: games.length - pickedGames,
    undecidedGames: pickedGames - decidedGames,
    canLock: decidedGames === games.length,
  };
}

function createBallotId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return "ballot-" + Date.now() + "-" + Math.random().toString(36).slice(2);
}

export function createLockedBallot(
  predictions: GamePredictionStore,
  now = new Date()
): LockedBallot {
  const progress = getBallotProgress(predictions);
  if (!progress.canLock) {
    throw new Error(
      "Complete every game and choose a favorite for each neutral 50% matchup before locking."
    );
  }

  return {
    id: createBallotId(),
    season: 2026,
    lockedAt: now.toISOString(),
    predictions: JSON.parse(JSON.stringify(predictions)) as GamePredictionStore,
  };
}

export function loadLockedBallots(storage: StorageLike): LockedBallot[] {
  try {
    const value = JSON.parse(
      storage.getItem(LOCKED_BALLOTS_KEY) || "[]"
    ) as LockedBallot[];
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function lockCurrentBallot(
  storage: StorageLike,
  predictions: GamePredictionStore,
  now = new Date()
): LockedBallot {
  const ballot = createLockedBallot(predictions, now);
  const ballots = loadLockedBallots(storage);
  storage.setItem(LOCKED_BALLOTS_KEY, JSON.stringify([...ballots, ballot]));
  return ballot;
}
