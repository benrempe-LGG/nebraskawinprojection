import { describe, expect, it } from "vitest";
import {
  CLOUD_ENTRY_VERSION,
  createCloudEntryPayload,
  parseCloudEntryPayload,
  restoreCloudEntryPayload,
} from "@/lib/cloudEntry";
import { CHAMPIONSHIP_PICKS_KEY } from "@/lib/championships";
import { GAME_PREDS_KEY, type GamePredictionStore } from "@/lib/predictionStore";

function predictionStore(): GamePredictionStore {
  return {
    "2026:Nebraska:Iowa": {
      firstTeam: "Iowa",
      secondTeam: "Nebraska",
      pctForFirstTeam: "42",
    },
  };
}

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("cloud entry payloads", () => {
  it("wraps predictions and championship picks in a versioned payload", () => {
    const payload = createCloudEntryPayload(predictionStore(), {
      "Big Ten": "Nebraska",
    });

    expect(payload.version).toBe(CLOUD_ENTRY_VERSION);
    expect(payload.predictions).toEqual(predictionStore());
    expect(payload.championshipPicks["Big Ten"]).toBe("Nebraska");
  });

  it("loads legacy flat prediction payloads", () => {
    const payload = parseCloudEntryPayload(predictionStore());

    expect(payload.version).toBe(2);
    expect(payload.predictions).toEqual(predictionStore());
    expect(payload.championshipPicks).toEqual({});
  });

  it("restores predictions and drops championship picks for stale participants", () => {
    const storage = memoryStorage();
    const payload = restoreCloudEntryPayload(storage, {
      version: 2,
      predictions: predictionStore(),
      championshipPicks: { "Big Ten": "Not A Participant" },
    });

    expect(JSON.parse(storage.getItem(GAME_PREDS_KEY) || "{}")).toEqual(
      predictionStore()
    );
    expect(payload.championshipPicks).toEqual({});
    expect(JSON.parse(storage.getItem(CHAMPIONSHIP_PICKS_KEY) || "{}")).toEqual(
      {}
    );
  });
});
