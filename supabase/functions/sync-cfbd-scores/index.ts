import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CFBD_BASE_URL = "https://api.collegefootballdata.com";

interface CfbdGame {
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

Deno.serve(async (request) => {
  const expectedSecret = Deno.env.get("SYNC_SECRET");
  if (expectedSecret && request.headers.get("x-sync-secret") !== expectedSecret) {
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
    supabase.from("teams").select("id, cfbd_team").not("cfbd_team", "is", null),
    supabase.from("games").select("id, home_team_id, away_team_id").eq("season", season),
  ]);
  if (teamError) return Response.json({ error: teamError.message }, { status: 500 });
  if (gameError) return Response.json({ error: gameError.message }, { status: 500 });

  const teamIds = new Map((teams ?? []).map((team) => [team.cfbd_team, team.id]));
  const gameIds = new Map(
    (existingGames ?? []).map((game) => [
      `${game.home_team_id}|${game.away_team_id}`,
      game.id,
    ]),
  );

  const rows = incoming.flatMap((game) => {
    const homeTeamId = teamIds.get(game.home_team);
    const awayTeamId = teamIds.get(game.away_team);
    if (!homeTeamId || !awayTeamId) return [];

    const existingId = gameIds.get(`${homeTeamId}|${awayTeamId}`);
    return [{
      ...(existingId ? { id: existingId } : {}),
      season: game.season,
      week: game.week,
      kickoff_at: game.start_date,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      neutral_site: game.neutral_site,
      venue: game.venue,
      cfbd_game_id: game.id,
      status: game.completed ? "final" : "scheduled",
      home_score: game.home_points,
      away_score: game.away_points,
      completed_at: game.completed ? new Date().toISOString() : null,
    }];
  });

  if (rows.length) {
    const { error } = await supabase.from("games").upsert(rows, { onConflict: "id" });
    if (error) return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({
    season,
    week: weekParam ? Number(weekParam) : null,
    received: incoming.length,
    matched: rows.length,
    skipped: incoming.length - rows.length,
    entries_locked: entriesLocked ?? 0,
  });
});
