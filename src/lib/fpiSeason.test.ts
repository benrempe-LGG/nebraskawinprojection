import { describe, expect, it } from "vitest";
import { P4_CONFERENCES } from "@/lib/championships";
import { buildFpiSeasonProjection } from "@/lib/fpiSeason";

describe("FPI end-of-year projection", () => {
  const projection = buildFpiSeasonProjection();

  it("produces complete standings for every P4 conference", () => {
    expect(Object.keys(projection.standings).sort()).toEqual(
      [...P4_CONFERENCES].sort(),
    );
    expect(
      Object.values(projection.standings).flat().every(
        (row) => row.overallWins + row.overallLosses === 12,
      ),
    ).toBe(true);
    expect(projection.standings.ACC[0].team).toBe("Miami");
    expect(projection.standings["Big 12"][0].team).toBe("Texas Tech");
  });

  it("projects four neutral-site conference champions", () => {
    expect(projection.championships).toHaveLength(4);
    for (const game of projection.championships) {
      expect([game.firstTeam, game.secondTeam]).toContain(game.winner);
      expect(game.projection.location).toBe("NEUTRAL");
    }
  });

  it("produces a complete eleven-team P4/Notre Dame field plus G6 reserve", () => {
    expect(projection.playoff.complete).toBe(true);
    expect(projection.playoff.championshipsComplete).toBe(true);
    expect(projection.playoff.teams).toHaveLength(11);
    expect(projection.playoff.groupOfSixSeed).toBe(12);
  });
});
