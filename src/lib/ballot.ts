import { ALL_TEAMS } from "@/lib/oddsmaker";
import {
  getGameId,
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

export function getSeasonGameIds(): string[] {
  const ids = new Set<string>();

  for (const [team, info] of Object.entries(ALL_TEAMS)) {
    info.schedule.forEach((game) => ids.add(getGameId(team, game)));
  }

  return [...ids].sort();
}

export function getBallotProgress(
  predictions: GamePredictionStore
): BallotProgress {
  const gameIds = getSeasonGameIds();
  let pickedGames = 0;
  let decidedGames = 0;

  gameIds.forEach((id) => {
    const value = predictions[id]?.pctForFirstTeam;
    if (value === undefined || value === "") return;

    pickedGames += 1;
    if (Number.parseFloat(value) !== 50) decidedGames += 1;
  });

  return {
    totalGames: gameIds.length,
    pickedGames,
    decidedGames,
    remainingGames: gameIds.length - pickedGames,
    undecidedGames: pickedGames - decidedGames,
    canLock: decidedGames === gameIds.length,
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
      "Complete every game and choose a side for each 50% matchup before locking."
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
