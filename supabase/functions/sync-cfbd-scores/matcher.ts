// Pure, dependency-free helpers for matching CFBD games against the canonical
// 2026 catalog. Kept free of Deno/Supabase imports so it is unit-testable via
// vitest from `src/lib/cfbdMatcher.test.ts`.

// Known differences between CFBD's team names and the names stored in
// public.teams.name / public.teams.cfbd_team. Keys are the CFBD-side spelling,
// values are the catalog spelling. Extend this map when a new mismatch is
// observed rather than adding one-off logic elsewhere.
export const CFBD_TEAM_ALIASES: Record<string, string> = {
  "App State": "Appalachian State",
  "Appalachian St": "Appalachian State",
  "Hawai'i": "Hawaii",
  "San José State": "San Jose State",
  "UMass": "Massachusetts",
  "Southern Miss": "Southern Mississippi",
  "UL Monroe": "Louisiana Monroe",
  "Louisiana-Monroe": "Louisiana Monroe",
  "ULM": "Louisiana Monroe",
  "Louisiana-Lafayette": "Louisiana",
  "UL Lafayette": "Louisiana",
  "Sam Houston": "Sam Houston State",
  "Kennesaw": "Kennesaw State",
  "Miami (FL)": "Miami",
};

/** Collapse whitespace, trim, and strip zero-width chars. Case is preserved. */
export function normalizeTeamName(input: string): string {
  return input
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function lowerKey(input: string): string {
  return normalizeTeamName(input).toLowerCase();
}

export interface TeamRow {
  id: string;
  name: string;
  cfbd_team: string | null;
}

export interface CanonicalGame {
  id: string;
  home_team_id: string;
  away_team_id: string;
}

export interface TeamIndex {
  resolve(cfbdName: string): string | undefined;
}

export function buildTeamIndex(teams: TeamRow[]): TeamIndex {
  const byKey = new Map<string, string>();
  const add = (label: string | null | undefined, id: string) => {
    if (!label) return;
    const key = lowerKey(label);
    if (key) byKey.set(key, id);
  };
  for (const team of teams) {
    add(team.name, team.id);
    add(team.cfbd_team, team.id);
  }
  return {
    resolve(cfbdName: string) {
      const cleaned = normalizeTeamName(cfbdName);
      if (!cleaned) return undefined;
      const aliased = CFBD_TEAM_ALIASES[cleaned];
      if (aliased) {
        const hit = byKey.get(lowerKey(aliased));
        if (hit) return hit;
      }
      return byKey.get(cleaned.toLowerCase());
    },
  };
}

export type GameIndex = Map<string, { id: string; reversed: boolean }>;

/**
 * Build an unordered-pair index keyed by `${teamA}|${teamB}` for both
 * orientations so an incoming CFBD row can find the canonical row no matter
 * which side CFBD labels as home. `reversed=true` means the incoming
 * home/away is flipped versus the stored canonical row.
 */
export function buildGameIndex(games: CanonicalGame[]): GameIndex {
  const map: GameIndex = new Map();
  for (const game of games) {
    map.set(`${game.home_team_id}|${game.away_team_id}`, { id: game.id, reversed: false });
    // Only register the reverse orientation if it doesn't collide with an
    // existing canonical row (rare, but keeps the stored row authoritative).
    const reverseKey = `${game.away_team_id}|${game.home_team_id}`;
    if (!map.has(reverseKey)) {
      map.set(reverseKey, { id: game.id, reversed: true });
    }
  }
  return map;
}

export type MatchResult =
  | { kind: "matched"; gameId: string; reversed: boolean }
  | { kind: "unmatched_team"; team: string }
  | { kind: "no_canonical_game"; home: string; away: string };

export function matchIncomingGame(
  homeCfbd: string,
  awayCfbd: string,
  teamIndex: TeamIndex,
  gameIndex: GameIndex,
): MatchResult {
  const homeId = teamIndex.resolve(homeCfbd);
  if (!homeId) return { kind: "unmatched_team", team: normalizeTeamName(homeCfbd) };
  const awayId = teamIndex.resolve(awayCfbd);
  if (!awayId) return { kind: "unmatched_team", team: normalizeTeamName(awayCfbd) };
  const hit = gameIndex.get(`${homeId}|${awayId}`);
  if (!hit) {
    return {
      kind: "no_canonical_game",
      home: normalizeTeamName(homeCfbd),
      away: normalizeTeamName(awayCfbd),
    };
  }
  return { kind: "matched", gameId: hit.id, reversed: hit.reversed };
}

export interface CfbdGameLike {
  id: number;
  season: number;
  week: number;
  start_date: string;
  completed: boolean;
  neutral_site: boolean;
  venue: string | null;
  home_team: string;
  home_points: number | null;
  away_team: string;
  away_points: number | null;
}

export interface CanonicalUpdate {
  id: string;
  cfbd_game_id: number;
  week: number;
  kickoff_at: string;
  neutral_site: boolean;
  venue: string | null;
  status: "scheduled" | "final";
  home_score: number | null;
  away_score: number | null;
  completed_at: string | null;
}

/**
 * Build a canonical UPDATE payload for a matched incoming row. If the incoming
 * CFBD orientation is reversed relative to the stored row, swap the scores so
 * `home_score` / `away_score` always refer to the stored canonical home/away.
 */
export function buildCanonicalUpdate(
  incoming: CfbdGameLike,
  match: Extract<MatchResult, { kind: "matched" }>,
  now: string,
): CanonicalUpdate {
  const [homeScore, awayScore] = match.reversed
    ? [incoming.away_points, incoming.home_points]
    : [incoming.home_points, incoming.away_points];
  return {
    id: match.gameId,
    cfbd_game_id: incoming.id,
    week: incoming.week,
    kickoff_at: incoming.start_date,
    neutral_site: incoming.neutral_site,
    venue: incoming.venue,
    status: incoming.completed ? "final" : "scheduled",
    home_score: homeScore,
    away_score: awayScore,
    completed_at: incoming.completed ? now : null,
  };
}