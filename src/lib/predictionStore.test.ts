import { describe, expect, it } from "vitest";
import type { Game } from "@/lib/oddsmaker";
import {
  getGameId,
  getTeamGamePrediction,
  setTeamGamePrediction,
} from "@/lib/predictionStore";

const nebraskaGame: Game = {
  week: 11,
  date: "SAT NOV 21",
  opponent: "Ohio State",
  loc: "HOME",
  venue: "Home",
};

const ohioStateGame: Game = {
  week: 11,
  date: "NOV 21",
  opponent: "Nebraska",
  loc: "AWAY",
  venue: "Away",
};

describe("canonical matchup predictions", () => {
  it("builds the same game id from either team's schedule", () => {
    expect(getGameId("Nebraska", nebraskaGame)).toBe(
      getGameId("Ohio State", ohioStateGame)
    );
  });

  it("shows the complementary probability to the opponent", () => {
    const store = setTeamGamePrediction({}, "Nebraska", nebraskaGame, "65");

    expect(getTeamGamePrediction(store, "Nebraska", nebraskaGame)).toBe("65");
    expect(getTeamGamePrediction(store, "Ohio State", ohioStateGame)).toBe("35");
  });

  it("updates the same matchup from either team's page", () => {
    const initial = setTeamGamePrediction({}, "Nebraska", nebraskaGame, "65");
    const updated = setTeamGamePrediction(
      initial,
      "Ohio State",
      ohioStateGame,
      "72.5"
    );

    expect(Object.keys(updated)).toHaveLength(1);
    expect(getTeamGamePrediction(updated, "Ohio State", ohioStateGame)).toBe(
      "72.5"
    );
    expect(getTeamGamePrediction(updated, "Nebraska", nebraskaGame)).toBe(
      "27.5"
    );
  });

  it("clears the shared matchup from either team's page", () => {
    const initial = setTeamGamePrediction({}, "Nebraska", nebraskaGame, "65");
    const cleared = setTeamGamePrediction(
      initial,
      "Ohio State",
      ohioStateGame,
      ""
    );

    expect(cleared).toEqual({});
  });
});
