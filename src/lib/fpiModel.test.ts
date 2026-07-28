import { describe, expect, it } from "vitest";
import {
  buildFpiModelEntry,
  expectedFpiWins,
  getFpiTeamRating,
  probabilityFromExpectedMargin,
  projectFpiGame,
} from "@/lib/fpiModel";
import { ALL_TEAMS } from "@/lib/oddsmaker";

describe("FPI-based public benchmark", () => {
  it("maps app team names to the published ESPN ratings", () => {
    expect(getFpiTeamRating("Nebraska")).toMatchObject({
      rating: 8.8,
      rated: true,
    });
    expect(getFpiTeamRating("Cal")).toMatchObject({
      rating: 0.9,
      rated: true,
    });
    expect(getFpiTeamRating("Ohio")).toMatchObject({
      rating: -8,
      rated: true,
    });
    const unratedTeams = Object.keys(ALL_TEAMS).filter(
      (team) => !getFpiTeamRating(team).rated,
    );
    expect(unratedTeams).toEqual([]);
  });

  it("uses the documented fallback only for unrated opponents", () => {
    expect(getFpiTeamRating("North Dakota")).toEqual({
      rating: -25,
      rated: false,
      espnName: null,
    });
  });

  it("keeps opposite expected margins complementary", () => {
    expect(
      probabilityFromExpectedMargin(9)
      + probabilityFromExpectedMargin(-9),
    ).toBe(100);
  });

  it("applies home field in the correct direction", () => {
    const home = projectFpiGame("Nebraska", {
      week: 1,
      date: "SEP 5",
      opponent: "Iowa",
      loc: "HOME",
      venue: "Home",
    });
    const away = projectFpiGame("Nebraska", {
      week: 1,
      date: "SEP 5",
      opponent: "Iowa",
      loc: "AWAY",
      venue: "Away",
    });

    expect(home.expectedMargin - away.expectedMargin).toBeCloseTo(5, 5);
    expect(home.winProbability).toBeGreaterThan(away.winProbability);
  });

  it("reproduces ESPN's displayed Nebraska projection to one decimal", () => {
    expect(expectedFpiWins("Nebraska")).toBe(6.7);
  });

  it("seeds one canonical prediction for every public-beta game", () => {
    expect(Object.keys(buildFpiModelEntry())).toHaveLength(476);
  });
});
