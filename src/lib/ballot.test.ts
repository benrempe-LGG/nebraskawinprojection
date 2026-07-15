import { describe, expect, it } from "vitest";
import { ALL_TEAMS } from "@/lib/oddsmaker";
import {
  createLockedBallot,
  getBallotProgress,
  getSeasonGameIds,
} from "@/lib/ballot";
import {
  getGameId,
  setTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";

function completeSeason(value = "60"): GamePredictionStore {
  let store: GamePredictionStore = {};
  const seen = new Set<string>();

  for (const [team, info] of Object.entries(ALL_TEAMS)) {
    for (const game of info.schedule) {
      const id = getGameId(team, game);
      if (seen.has(id)) continue;
      seen.add(id);
      store = setTeamGamePrediction(store, team, game, value);
    }
  }

  return store;
}

describe("season ballots", () => {
  it("counts unique matchups only once", () => {
    const progress = getBallotProgress({});
    expect(progress.totalGames).toBe(getSeasonGameIds().length);
    expect(progress.totalGames).toBeGreaterThan(300);
    expect(progress.pickedGames).toBe(0);
    expect(progress.canLock).toBe(false);
  });

  it("requires a chosen side for every matchup", () => {
    const predictions = completeSeason("50");
    const progress = getBallotProgress(predictions);

    expect(progress.remainingGames).toBe(0);
    expect(progress.undecidedGames).toBe(progress.totalGames);
    expect(progress.canLock).toBe(false);
    expect(() => createLockedBallot(predictions)).toThrow(/choose a side/i);
  });

  it("creates an immutable snapshot of a complete ballot", () => {
    const predictions = completeSeason();
    const lockedAt = new Date("2026-08-01T12:00:00.000Z");
    const ballot = createLockedBallot(predictions, lockedAt);
    const firstId = getSeasonGameIds()[0];
    const lockedValue = ballot.predictions[firstId].pctForFirstTeam;

    predictions[firstId].pctForFirstTeam = "10";

    expect(ballot.season).toBe(2026);
    expect(ballot.lockedAt).toBe("2026-08-01T12:00:00.000Z");
    expect(ballot.predictions[firstId].pctForFirstTeam).toBe(lockedValue);
    expect(getBallotProgress(ballot.predictions).canLock).toBe(true);
  });
});
