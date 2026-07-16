-- Register the canonical app schedule and turn submitted JSON entries into scoreable predictions.

alter table public.games
  add column if not exists canonical_key text unique,
  add column if not exists date_label text;

update public.seasons
set ballot_deadline = '2026-08-28 23:59:59-04'
where year = 2026;

create function public.sync_2026_catalog(catalog jsonb)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  item jsonb;
  home_id uuid;
  away_id uuid;
  synced integer := 0;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(catalog) <> 'array' then raise exception 'Catalog must be an array'; end if;

  for item in select value from jsonb_array_elements(catalog)
  loop
    if item->>'key' is null or item->>'home' is null or item->>'away' is null then
      raise exception 'Invalid catalog game';
    end if;

    insert into public.teams (slug, name, conference, cfbd_team)
    values (
      lower(regexp_replace(item->>'home', '[^a-zA-Z0-9]+', '-', 'g')),
      item->>'home',
      nullif(item->>'homeConference', ''),
      item->>'home'
    )
    on conflict (name) do update set
      conference = coalesce(excluded.conference, teams.conference),
      cfbd_team = coalesce(teams.cfbd_team, excluded.cfbd_team)
    returning id into home_id;

    insert into public.teams (slug, name, conference, cfbd_team)
    values (
      lower(regexp_replace(item->>'away', '[^a-zA-Z0-9]+', '-', 'g')),
      item->>'away',
      nullif(item->>'awayConference', ''),
      item->>'away'
    )
    on conflict (name) do update set
      conference = coalesce(excluded.conference, teams.conference),
      cfbd_team = coalesce(teams.cfbd_team, excluded.cfbd_team)
    returning id into away_id;

    insert into public.games (
      season, week, date_label, home_team_id, away_team_id,
      neutral_site, venue, canonical_key
    )
    values (
      2026,
      greatest(0, least(20, coalesce((item->>'week')::integer, 0))),
      item->>'dateLabel',
      home_id,
      away_id,
      coalesce((item->>'neutral')::boolean, false),
      item->>'venue',
      item->>'key'
    )
    on conflict (canonical_key) do update set
      week = excluded.week,
      date_label = excluded.date_label,
      home_team_id = excluded.home_team_id,
      away_team_id = excluded.away_team_id,
      neutral_site = excluded.neutral_site,
      venue = excluded.venue;

    synced := synced + 1;
  end loop;

  return synced;
end;
$$;

create or replace function public.submit_entry(payload jsonb, expected_games integer, target_season integer default 2026)
returns public.ballots
language plpgsql security definer set search_path = ''
as $$
declare
  result public.ballots;
  pick record;
  game_row public.games;
  first_id uuid;
  second_id uuid;
  winner_id uuid;
  pct numeric;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' or jsonb_object_length(payload) <> expected_games then
    raise exception 'Every season game must have a projected winner before submission';
  end if;

  insert into public.ballots (user_id, season, status, submitted_at, draft_payload)
  values (auth.uid(), target_season, 'submitted', now(), payload)
  on conflict (user_id, season) do update
    set status = 'submitted', submitted_at = now(), draft_payload = excluded.draft_payload
    where ballots.status in ('draft', 'submitted')
  returning * into result;

  if result.id is null then raise exception 'This entry is already locked'; end if;

  delete from public.predictions where ballot_id = result.id;

  for pick in select key, value from jsonb_each(payload)
  loop
    select * into game_row
    from public.games
    where season = target_season and canonical_key = pick.key;

    if game_row.id is null then raise exception 'Schedule game is missing: %', pick.key; end if;

    select id into first_id from public.teams where name = pick.value->>'firstTeam';
    select id into second_id from public.teams where name = pick.value->>'secondTeam';
    pct := (pick.value->>'pctForFirstTeam')::numeric;

    if first_id is null or second_id is null or pct is null then
      raise exception 'Invalid prediction for %', pick.key;
    end if;

    if pct > 50 then winner_id := first_id;
    elsif pct < 50 then winner_id := second_id;
    elsif game_row.home_team_id in (first_id, second_id) then winner_id := game_row.home_team_id;
    else raise exception 'Neutral 50%% game needs a winner: %', pick.key;
    end if;

    insert into public.predictions (
      ballot_id, game_id, predicted_winner_id, win_probability
    )
    values (
      result.id, game_row.id, winner_id,
      case when winner_id = first_id then pct else 100 - pct end
    );
  end loop;

  return result;
end;
$$;

grant execute on function public.sync_2026_catalog(jsonb) to authenticated;
grant execute on function public.submit_entry(jsonb, integer, integer) to authenticated;
