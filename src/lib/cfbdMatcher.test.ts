import { describe, expect, it } from "vitest";
import {
  buildCanonicalUpdate,
  buildGameIndex,
  buildTeamIndex,
  matchIncomingGame,
  normalizeTeamName,
  type CfbdGameLike,
} from "../../supabase/functions/sync-cfbd-scores/matcher";

const NEB = "11111111-1111-1111-1111-111111111111";
const OSU = "22222222-2222-2222-2222-222222222222";
const APP = "33333333-3333-3333-3333-333333333333";
const GAME_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const GAME_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const teams = [
  { id: NEB, name: "Nebraska", cfbd_team: "Nebraska" },
  { id: OSU, name: "Ohio State", cfbd_team: "Ohio State" },
  { id: APP, name: "Appalachian State", cfbd_team: "Appalachian State" },
];

const canonicalGames = [
  { id: GAME_A, home_team_id: NEB, away_team_id: OSU }, // Nebraska hosts OSU
  { id: GAME_B, home_team_id: APP, away_team_id: NEB }, // App State hosts Nebraska
];

function makeGame(overrides: Partial<CfbdGameLike> = {}): CfbdGameLike {
  return {
    id: 900001,
    season: 2026,
    week: 3,
    start_date: "2026-09-12T23:30:00Z",
    completed: true,
    neutral_site: false,
    venue: "Memorial Stadium",
    home_team: "Nebraska",
    home_points: 24,
    away_team: "Ohio State",
    away_points: 21,
    ...overrides,
  };
}

describe("normalizeTeamName", () => {
  it("collapses whitespace and trims", () => {
    expect(normalizeTeamName("  Ohio   State \n")).toBe("Ohio State");
  });
});

describe("matchIncomingGame", () => {
  const teamIndex = buildTeamIndex(teams);
  const gameIndex = buildGameIndex(canonicalGames);

  it("matches same orientation without reversing", () => {
    const r = matchIncomingGame("Nebraska", "Ohio State", teamIndex, gameIndex);
    expect(r).toEqual({ kind: "matched", gameId: GAME_A, reversed: false });
  });

  it("matches reversed orientation and flags reversed=true", () => {
    const r = matchIncomingGame("Ohio State", "Nebraska", teamIndex, gameIndex);
    expect(r).toEqual({ kind: "matched", gameId: GAME_A, reversed: true });
  });

  it("resolves teams via the CFBD alias map", () => {
    const r = matchIncomingGame("App State", "Nebraska", teamIndex, gameIndex);
    expect(r).toEqual({ kind: "matched", gameId: GAME_B, reversed: false });
  });

  it("reports unmatched CFBD team names without inserting", () => {
    const r = matchIncomingGame("Nebraska", "Some FCS Team", teamIndex, gameIndex);
    expect(r).toEqual({ kind: "unmatched_team", team: "Some FCS Team" });
  });

  it("reports missing canonical matchup when both teams known but not scheduled", () => {
    const r = matchIncomingGame("Ohio State", "Appalachian State", teamIndex, gameIndex);
    expect(r.kind).toBe("no_canonical_game");
  });
});

describe("buildCanonicalUpdate", () => {
  const teamIndex = buildTeamIndex(teams);
  const gameIndex = buildGameIndex(canonicalGames);
  const NOW = "2026-09-13T03:00:00.000Z";

  it("keeps scores aligned to canonical home/away for same orientation", () => {
    const incoming = makeGame();
    const match = matchIncomingGame(incoming.home_team, incoming.away_team, teamIndex, gameIndex);
    if (match.kind !== "matched") throw new Error("expected match");
    const patch = buildCanonicalUpdate(incoming, match, NOW);
    expect(patch.id).toBe(GAME_A);
    expect(patch.home_score).toBe(24);
    expect(patch.away_score).toBe(21);
    expect(patch.status).toBe("final");
    expect(patch.completed_at).toBe(NOW);
    expect(patch.cfbd_game_id).toBe(incoming.id);
  });

  it("swaps scores when CFBD orientation is reversed", () => {
    const incoming = makeGame({
      home_team: "Ohio State",
      away_team: "Nebraska",
      home_points: 21,
      away_points: 24,
    });
    const match = matchIncomingGame(incoming.home_team, incoming.away_team, teamIndex, gameIndex);
    if (match.kind !== "matched") throw new Error("expected match");
    const patch = buildCanonicalUpdate(incoming, match, NOW);
    expect(patch.id).toBe(GAME_A);
    // Canonical row is Nebraska home / Ohio State away, so Nebraska's 24 must
    // land in home_score even though CFBD flipped the sides.
    expect(patch.home_score).toBe(24);
    expect(patch.away_score).toBe(21);
  });

  it("is idempotent: running twice produces identical update payloads", () => {
    const incoming = makeGame();
    const match = matchIncomingGame(incoming.home_team, incoming.away_team, teamIndex, gameIndex);
    if (match.kind !== "matched") throw new Error("expected match");
    const first = buildCanonicalUpdate(incoming, match, NOW);
    const second = buildCanonicalUpdate(incoming, match, NOW);
    expect(first).toEqual(second);
    // And the update targets the same primary key, so a repeat run touches the
    // same row rather than inserting a duplicate.
    expect(first.id).toBe(second.id);
  });

  it("leaves completed_at null and status=scheduled for in-progress games", () => {
    const incoming = makeGame({ completed: false, home_points: null, away_points: null });
    const match = matchIncomingGame(incoming.home_team, incoming.away_team, teamIndex, gameIndex);
    if (match.kind !== "matched") throw new Error("expected match");
    const patch = buildCanonicalUpdate(incoming, match, NOW);
    expect(patch.status).toBe("scheduled");
    expect(patch.completed_at).toBeNull();
    expect(patch.home_score).toBeNull();
    expect(patch.away_score).toBeNull();
  });
});