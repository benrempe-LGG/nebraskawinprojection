import { describe, expect, it } from "vitest";
import { ALL_TEAMS, CONFERENCES, isConferenceGame } from "@/lib/oddsmaker";

describe("2026 conference schedule integrity", () => {
  it("gives every Big 12 team nine reciprocal conference games", () => {
    for (const team of CONFERENCES["Big 12"]) {
      const schedule = ALL_TEAMS[team].schedule;
      const games = schedule.filter((game) =>
        isConferenceGame(game.opponent, team)
      );
      expect(schedule, team).toHaveLength(12);
      expect(schedule.some((game) => game.date === "TBD"), team).toBe(false);
      expect(games, team).toHaveLength(9);
    }
  });

  it("uses the ACC transition-year eight/nine game model", () => {
    const eightGameTeams = new Set([
      "Boston College",
      "Clemson",
      "Florida State",
      "Georgia Tech",
      "North Carolina",
    ]);

    for (const team of CONFERENCES.ACC) {
      const games = ALL_TEAMS[team].schedule.filter((game) =>
        isConferenceGame(game.opponent, team)
      );
      expect(games, team).toHaveLength(eightGameTeams.has(team) ? 8 : 9);
    }
  });

  it("lists every ACC and Big 12 matchup once on both schedules", () => {
    for (const conference of ["ACC", "Big 12"]) {
      for (const team of CONFERENCES[conference]) {
        const games = ALL_TEAMS[team].schedule.filter((game) =>
          isConferenceGame(game.opponent, team)
        );

        expect(new Set(games.map((game) => game.opponent)).size, team).toBe(
          games.length
        );

        for (const game of games) {
          const reverse = ALL_TEAMS[game.opponent].schedule.filter(
            (candidate) => candidate.opponent === team
          );
          expect(reverse, team + " vs " + game.opponent).toHaveLength(1);
        }
      }
    }
  });
});
