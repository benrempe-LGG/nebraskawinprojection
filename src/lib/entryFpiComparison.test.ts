import { describe, expect, it } from "vitest";
import { buildFpiModelEntry } from "@/lib/fpiModel";
import { buildFpiSeasonProjection } from "@/lib/fpiSeason";
import { compareEntryToFpi } from "@/lib/entryFpiComparison";
import { setTeamGamePrediction } from "@/lib/predictionStore";
import { ALL_TEAMS } from "@/lib/oddsmaker";

describe("entry versus FPI comparison", () => {
  it("reports no differences when the entry is the FPI benchmark", () => {
    const fpiSeason = buildFpiSeasonProjection();
    const picks = Object.fromEntries(
      fpiSeason.championships.map((game) => [game.conference, game.winner]),
    );
    const result = compareEntryToFpi(buildFpiModelEntry(), picks);

    expect(result.comparedGames).toBe(476);
    expect(result.oppositeWinners).toHaveLength(0);
    expect(result.averageProbabilityGap).toBe(0);
    expect(result.teams.every((team) => team.expectedWinGap === 0)).toBe(true);
    expect(result.userOnlyPlayoffTeams).toEqual([]);
    expect(result.fpiOnlyPlayoffTeams).toEqual([]);
  });

  it("finds an opposite winner and team-level gap on a partial entry", () => {
    const game = ALL_TEAMS.Nebraska.schedule[0];
    const entry = setTeamGamePrediction({}, "Nebraska", game, "20");
    const result = compareEntryToFpi(entry);

    expect(result.comparedGames).toBe(1);
    expect(result.oppositeWinners).toHaveLength(1);
    expect(result.oppositeWinners[0]).toMatchObject({
      team: "Nebraska",
      opponent: "Ohio",
      userWinner: "Ohio",
      fpiWinner: "Nebraska",
    });
    expect(result.teams.find((team) => team.team === "Nebraska")).toMatchObject({
      comparedGames: 1,
      expectedWinGap: -0.633,
    });
  });
});
