import { describe, expect, it } from "vitest";
import { getTeamSchedule } from "@/lib/oddsmaker";
import { setTeamGamePrediction } from "@/lib/predictionStore";
import { computeConferenceStandings } from "@/lib/standings";

const nebraskaVsOhioState = getTeamSchedule("Nebraska").find(
  (game) => game.opponent === "Ohio State"
)!;

describe("conference standings", () => {
  it("turns a shared matchup prediction into one win and one loss", () => {
    const predictions = setTeamGamePrediction(
      {},
      "Nebraska",
      nebraskaVsOhioState,
      "65"
    );
    const rows = computeConferenceStandings(predictions)["Big Ten"];
    const nebraska = rows.find((row) => row.team === "Nebraska")!;
    const ohioState = rows.find((row) => row.team === "Ohio State")!;

    expect(nebraska).toMatchObject({
      wins: 1,
      losses: 0,
      projectedGames: 1,
    });
    expect(ohioState).toMatchObject({
      wins: 0,
      losses: 1,
      projectedGames: 1,
    });
  });

  it("defaults a 50 percent game to the home favorite", () => {
    const predictions = setTeamGamePrediction(
      {},
      "Nebraska",
      nebraskaVsOhioState,
      "50"
    );
    const rows = computeConferenceStandings(predictions)["Big Ten"];
    const nebraska = rows.find((row) => row.team === "Nebraska")!;

    expect(nebraska).toMatchObject({
      wins: 1,
      losses: 0,
      undecided: 0,
      projectedGames: 1,
    });
  });
});
