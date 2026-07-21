-- Restrict global 2026 catalog mutation to trusted server-side provisioning.
-- Ordinary signed-in users must never be able to rewrite shared teams or games.

create or replace function public.sync_2026_catalog(catalog jsonb)
returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  item jsonb;
  home_id uuid;
  away_id uuid;
  synced integer := 0;
begin
  if coalesce(auth.jwt() ->> 'role', '') <> 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;
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

revoke all privileges on function public.sync_2026_catalog(jsonb) from public;
revoke all privileges on function public.sync_2026_catalog(jsonb) from anon;
revoke all privileges on function public.sync_2026_catalog(jsonb) from authenticated;
grant execute on function public.sync_2026_catalog(jsonb) to service_role;

comment on function public.sync_2026_catalog(jsonb) is
  'Trusted provisioning only. Requires a service-role JWT and is not callable by application users.';
