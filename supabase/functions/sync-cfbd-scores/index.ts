import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  buildCanonicalUpdate,
  buildGameIndex,
  buildTeamIndex,
  matchIncomingGame,
  type CfbdGameLike,
} from "./matcher.ts";

const CFBD_BASE_URL = "https://api.collegefootballdata.com";

type CfbdGame = CfbdGameLike;

Deno.serve(async (request) => {
  const expectedSecret = Deno.env.get("SYNC_SECRET");
  if (!expectedSecret?.trim()) {
    return new Response("Missing SYNC_SECRET configuration", { status: 500 });
  }

  if (request.headers.get("x-sync-secret") !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const cfbdKey = Deno.env.get("CFBD_API_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!cfbdKey || !supabaseUrl || !serviceRoleKey) {
    return new Response("Missing server configuration", { status: 500 });
  }

  const url = new URL(request.url);
  const season = Number(url.searchParams.get("season") ?? "2026");
  const weekParam = url.searchParams.get("week");
  const cfbdUrl = new URL("/games", CFBD_BASE_URL);
  cfbdUrl.searchParams.set("year", String(season));
  cfbdUrl.searchParams.set("division", "fbs");
  if (weekParam) cfbdUrl.searchParams.set("week", weekParam);

  const cfbdResponse = await fetch(cfbdUrl, {
    headers: { Authorization: `Bearer ${cfbdKey}` },
  });
  if (!cfbdResponse.ok) {
    return new Response(`CFBD request failed: ${cfbdResponse.status}`, { status: 502 });
  }

  const incoming = (await cfbdResponse.json()) as CfbdGame[];
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: entriesLocked, error: lockError } = await supabase.rpc("lock_due_entries");
  if (lockError) {
    return Response.json({ error: "Entry deadline lock failed: " + lockError.message }, { status: 500 });
  }

  const [{ data: teams, error: teamError }, { data: existingGames, error: gameError }] = await Promise.all([
    supabase.from("teams").select("id, name, cfbd_team"),
    supabase.from("games").select("id, home_team_id, away_team_id").eq("season", season),
  ]);
  if (teamError) return Response.json({ error: teamError.message }, { status: 500 });
  if (gameError) return Response.json({ error: gameError.message }, { status: 500 });

  const teamIndex = buildTeamIndex(teams ?? []);
  const gameIndex = buildGameIndex(existingGames ?? []);
  const now = new Date().toISOString();

  const updates: ReturnType<typeof buildCanonicalUpdate>[] = [];
  const unmatchedTeams = new Set<string>();
  const unmatchedGames: Array<{ home: string; away: string; cfbd_game_id: number }> = [];
  let reversedCount = 0;

  for (const game of incoming) {
    const match = matchIncomingGame(game.home_team, game.away_team, teamIndex, gameIndex);
    if (match.kind === "unmatched_team") {
      unmatchedTeams.add(match.team);
      continue;
    }
    if (match.kind === "no_canonical_game") {
      unmatchedGames.push({ home: match.home, away: match.away, cfbd_game_id: game.id });
      continue;
    }
    if (match.reversed) reversedCount += 1;
    updates.push(buildCanonicalUpdate(game, match, now));
  }

  // Update matched canonical rows in place by primary key. We deliberately do
  // NOT insert new rows here: the 2026 catalog is authoritative and inserting a
  // reversed row would violate the (season, home_team_id, away_team_id) unique
  // constraint or create a duplicate opposite-orientation game.
  let updated = 0;
  for (const row of updates) {
    const { id, ...patch } = row;
    const { error } = await supabase.from("games").update(patch).eq("id", id);
    if (error) {
      console.error("games update failed", { id, error: error.message });
      return Response.json({ error: error.message, failed_id: id }, { status: 500 });
    }
    updated += 1;
  }

  const summary = {
    season,
    week: weekParam ? Number(weekParam) : null,
    received: incoming.length,
    matched: updates.length,
    updated,
    reversed_orientation: reversedCount,
    unmatched_teams: Array.from(unmatchedTeams).sort(),
    unmatched_games: unmatchedGames,
    entries_locked: entriesLocked ?? 0,
  };

  if (unmatchedTeams.size || unmatchedGames.length) {
    console.warn("sync-cfbd-scores skipped rows", summary);
  }

  return Response.json(summary);
});
