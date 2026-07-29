import { CHAMPIONSHIP_PICKS_KEY } from "@/lib/championships";
import { GAME_PREDS_KEY, LEGACY_PREDS_KEY } from "@/lib/predictionStore";

export const ACTIVE_ENTRY_USER_KEY = "oddsmaker_active_entry_user";
const FAVORITE_TEAM_KEY = "oddsmaker_favorite_team";
const VEGAS_TOTALS_KEY = "oddsmaker_vegas_totals";

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const ACCOUNT_SCOPED_KEYS = [
  GAME_PREDS_KEY,
  LEGACY_PREDS_KEY,
  CHAMPIONSHIP_PICKS_KEY,
  FAVORITE_TEAM_KEY,
  VEGAS_TOTALS_KEY,
] as const;

export function syncStorageToAuthUser(
  storage: StorageLike,
  userId: string | null
): boolean {
  const previousUserId = storage.getItem(ACTIVE_ENTRY_USER_KEY);
  if (userId && previousUserId === userId) return false;
  if (!userId && !previousUserId) return false;

  ACCOUNT_SCOPED_KEYS.forEach((key) => storage.removeItem(key));

  if (userId) storage.setItem(ACTIVE_ENTRY_USER_KEY, userId);
  else storage.removeItem(ACTIVE_ENTRY_USER_KEY);

  return true;
}
