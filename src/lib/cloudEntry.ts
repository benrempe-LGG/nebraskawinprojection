import {
  CHAMPIONSHIP_PICKS_KEY,
  P4_CONFERENCES,
  getChampionshipGames,
  loadChampionshipPicks,
  type ChampionshipPicks,
} from "@/lib/championships";
import {
  GAME_PREDS_KEY,
  type GamePredictionStore,
  type StoredGamePrediction,
} from "@/lib/predictionStore";

export const CLOUD_ENTRY_VERSION = 2 as const;

export interface CloudEntryPayloadV2 {
  version: typeof CLOUD_ENTRY_VERSION;
  predictions: GamePredictionStore;
  championshipPicks: ChampionshipPicks;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrediction(value: unknown): value is StoredGamePrediction {
  if (!isRecord(value)) return false;
  return (
    typeof value.firstTeam === "string" &&
    typeof value.secondTeam === "string" &&
    typeof value.pctForFirstTeam === "string"
  );
}

function sanitizePredictions(value: unknown): GamePredictionStore {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, prediction]) => isPrediction(prediction))
  ) as GamePredictionStore;
}

function sanitizeChampionshipPicks(value: unknown): ChampionshipPicks {
  if (!isRecord(value)) return {};
  const picks: ChampionshipPicks = {};
  P4_CONFERENCES.forEach((conference) => {
    if (typeof value[conference] === "string") {
      picks[conference] = value[conference] as string;
    }
  });
  return picks;
}

export function createCloudEntryPayload(
  predictions: GamePredictionStore,
  championshipPicks: ChampionshipPicks
): CloudEntryPayloadV2 {
  return {
    version: CLOUD_ENTRY_VERSION,
    predictions: sanitizePredictions(predictions),
    championshipPicks: sanitizeChampionshipPicks(championshipPicks),
  };
}

export function parseCloudEntryPayload(value: unknown): CloudEntryPayloadV2 {
  if (isRecord(value) && value.version === CLOUD_ENTRY_VERSION) {
    return createCloudEntryPayload(
      sanitizePredictions(value.predictions),
      sanitizeChampionshipPicks(value.championshipPicks)
    );
  }

  // Version 1 stored the prediction map directly in draft_payload.
  return createCloudEntryPayload(sanitizePredictions(value), {});
}

export function restoreCloudEntryPayload(
  storage: StorageLike,
  value: unknown
): CloudEntryPayloadV2 {
  const payload = parseCloudEntryPayload(value);
  storage.setItem(GAME_PREDS_KEY, JSON.stringify(payload.predictions));
  storage.setItem(
    CHAMPIONSHIP_PICKS_KEY,
    JSON.stringify(payload.championshipPicks)
  );

  const championshipPicks = loadChampionshipPicks(
    storage,
    getChampionshipGames(payload.predictions)
  );

  return { ...payload, championshipPicks };
}
