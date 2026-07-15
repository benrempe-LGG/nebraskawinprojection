import { describe, expect, it } from "vitest";
import { ALL_TEAMS } from "@/lib/oddsmaker";
import {
  getGameId,
  setTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";
import {
  computeProjectedTeamRecords,
  projectPlayoffField,
} from "@/lib/playoff";

function completeSeason(): GamePredictionStore {
  let predictions: GamePredictionStore = {};
  const seen = new Set<string>();

  for (const [team, info] of Object.entries(ALL_TEAMS)) {
    for (const game of info.schedule) {
      const id = getGameId(team, game);
      if (seen.has(id)) continue;
      seen.add(id);
      predictions = setTeamGamePrediction(predictions, team, game, "60");
    }
  }

  predictions = setTeamGamePrediction(
    predictions,
    "Notre Dame",
    {
      week: 5,
      date: "OCT 3",
      opponent: "North Carolina",
      loc: "AWAY",
      venue: "Away",
    },
    "60"
  );

  return predictions;
}

describe("playoff outlook", () => {
  it("tracks Notre Dame with assumed wins over Rice and Navy", () => {
    const records = computeProjectedTeamRecords({});
    const notreDame = records.find((record) => record.team === "Notre Dame")!;

    expect(notreDame).toMatchObject({
      conference: "Independent",
      wins: 2,
      pickedGames: 2,
      totalGames: 12,
    });
  });

  it("computes overall records from each team's perspective", () => {
    const game = ALL_TEAMS.Nebraska.schedule.find(
      (item) => item.opponent === "Ohio State"
    )!;
    const predictions = setTeamGamePrediction(
      {},
      "Nebraska",
      game,
      "65"
    );
    const records = computeProjectedTeamRecords(predictions);
    const nebraska = records.find((record) => record.team === "Nebraska")!;
    const ohioState = records.find((record) => record.team === "Ohio State")!;

    expect(nebraska).toMatchObject({ wins: 1, losses: 0 });
    expect(ohioState).toMatchObject({ wins: 0, losses: 1 });
  });

  it("reserves four P4 champion bids, seven at-larges, and one G6 slot", () => {
    const outlook = projectPlayoffField(completeSeason());

    expect(outlook.teams).toHaveLength(11);
    expect(
      outlook.teams.filter((team) => team.qualification === "P4 champion")
    ).toHaveLength(4);
    expect(
      outlook.teams.filter((team) => team.qualification === "At-large")
    ).toHaveLength(7);
    expect(new Set(outlook.teams.map((team) => team.team)).size).toBe(11);
    expect(
      outlook.teams.filter(
        (team) => team.conference === "ACC" || team.conference === "Big 12"
      ).length
    ).toBeLessThanOrEqual(4);
    expect(outlook.groupOfSixSeed).toBe(12);
    expect(outlook.complete).toBe(true);
  });
});
