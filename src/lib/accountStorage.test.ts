import { describe, expect, it } from "vitest";
import {
  ACTIVE_ENTRY_USER_KEY,
  syncStorageToAuthUser,
} from "@/lib/accountStorage";
import { CHAMPIONSHIP_PICKS_KEY } from "@/lib/championships";
import { GAME_PREDS_KEY, LEGACY_PREDS_KEY } from "@/lib/predictionStore";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
}

describe("account-scoped browser storage", () => {
  it("clears predictions when a different user signs in", () => {
    const storage = memoryStorage({
      [ACTIVE_ENTRY_USER_KEY]: "owner",
      [GAME_PREDS_KEY]: '{"game":{"pctForFirstTeam":"61"}}',
      [LEGACY_PREDS_KEY]: '{"Nebraska":{"0":"61"}}',
      [CHAMPIONSHIP_PICKS_KEY]: '{"Big Ten":"Nebraska"}',
      oddsmaker_favorite_team: "Nebraska",
      oddsmaker_vegas_totals: '{"Nebraska":"6.5"}',
    });

    expect(syncStorageToAuthUser(storage, "member")).toBe(true);
    expect(storage.getItem(ACTIVE_ENTRY_USER_KEY)).toBe("member");
    expect(storage.getItem(GAME_PREDS_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_PREDS_KEY)).toBeNull();
    expect(storage.getItem(CHAMPIONSHIP_PICKS_KEY)).toBeNull();
    expect(storage.getItem("oddsmaker_favorite_team")).toBeNull();
    expect(storage.getItem("oddsmaker_vegas_totals")).toBeNull();
  });

  it("preserves storage for the same authenticated user", () => {
    const storage = memoryStorage({
      [ACTIVE_ENTRY_USER_KEY]: "owner",
      [GAME_PREDS_KEY]: '{"saved":true}',
    });

    expect(syncStorageToAuthUser(storage, "owner")).toBe(false);
    expect(storage.getItem(GAME_PREDS_KEY)).toBe('{"saved":true}');
  });

  it("starts the first authenticated account with empty storage", () => {
    const storage = memoryStorage({
      [GAME_PREDS_KEY]: '{"anonymous":true}',
      [LEGACY_PREDS_KEY]: '{"Nebraska":{"0":"75"}}',
    });

    expect(syncStorageToAuthUser(storage, "new-user")).toBe(true);
    expect(storage.getItem(ACTIVE_ENTRY_USER_KEY)).toBe("new-user");
    expect(storage.getItem(GAME_PREDS_KEY)).toBeNull();
    expect(storage.getItem(LEGACY_PREDS_KEY)).toBeNull();
  });

  it("clears account data on sign-out", () => {
    const storage = memoryStorage({
      [ACTIVE_ENTRY_USER_KEY]: "owner",
      [GAME_PREDS_KEY]: '{"saved":true}',
    });

    expect(syncStorageToAuthUser(storage, null)).toBe(true);
    expect(storage.getItem(ACTIVE_ENTRY_USER_KEY)).toBeNull();
    expect(storage.getItem(GAME_PREDS_KEY)).toBeNull();
  });
});
