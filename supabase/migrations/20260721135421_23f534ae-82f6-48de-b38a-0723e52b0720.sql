
-- 1. Extensions for independent scheduling
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Deadline enforcement trigger on ballots (write-boundary safety net)
create or replace function public.enforce_ballot_deadline()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deadline timestamptz;
begin
  -- Allow lock transitions (locked_payload immutability handled separately)
  if NEW.status = 'locked' then
    return NEW;
  end if;

  -- Trusted maintenance roles bypass the write-boundary check
  if current_user in ('service_role', 'supabase_admin', 'postgres') then
    return NEW;
  end if;

  select ballot_deadline into deadline
  from public.seasons
  where year = NEW.season;

  if deadline is not null and now() >= deadline then
    raise exception 'The entry deadline for the % season has passed', NEW.season
      using errcode = '22023';
  end if;

  return NEW;
end;
$$;

drop trigger if exists ballots_enforce_deadline on public.ballots;
create trigger ballots_enforce_deadline
before insert or update of status, draft_payload, submitted_at, season, user_id
on public.ballots
for each row execute function public.enforce_ballot_deadline();

-- 3. save_entry_draft: reject at/after deadline
create or replace function public.save_entry_draft(
  payload jsonb,
  target_season integer default 2026
)
returns public.ballots
language plpgsql
security invoker
set search_path = ''
as $$
declare
  result public.ballots;
  predictions_payload jsonb;
  championship_payload jsonb;
  deadline timestamptz;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'Entry payload must be an object';
  end if;

  select ballot_deadline into deadline
  from public.seasons where year = target_season;
  if deadline is not null and now() >= deadline then
    raise exception 'The entry deadline has passed' using errcode = '22023';
  end if;

  if payload->>'version' = '2' then
    predictions_payload := payload->'predictions';
    championship_payload := payload->'championshipPicks';
    if jsonb_typeof(predictions_payload) <> 'object'
      or jsonb_typeof(championship_payload) <> 'object' then
      raise exception 'Version 2 entry payload is invalid';
    end if;
  end if;

  insert into public.ballots (user_id, season, status, draft_payload)
  values (auth.uid(), target_season, 'draft', payload)
  on conflict (user_id, season) do update
    set draft_payload = excluded.draft_payload
    where ballots.status in ('draft', 'submitted')
  returning * into result;

  if result.id is null then
    raise exception 'This entry is locked and cannot be changed';
  end if;
  return result;
end;
$$;

-- 4. submit_entry: derive required count server-side, validate v2 championship picks, reject at/after deadline
create or replace function public.submit_entry(
  payload jsonb,
  expected_games integer,  -- kept for backward compatibility; ignored server-side
  target_season integer default 2026
)
returns public.ballots
language plpgsql
security definer
set search_path = ''
as $$
declare
  result public.ballots;
  predictions_payload jsonb;
  championship_payload jsonb;
  pick record;
  game_row public.games;
  first_id uuid;
  second_id uuid;
  winner_id uuid;
  pct numeric;
  deadline timestamptz;
  required_games integer;
  conf text;
  conf_pick text;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'Entry payload must be an object';
  end if;

  select ballot_deadline into deadline
  from public.seasons where year = target_season;
  if deadline is not null and now() >= deadline then
    raise exception 'The entry deadline has passed' using errcode = '22023';
  end if;

  if payload->>'version' = '2' then
    predictions_payload := payload->'predictions';
    championship_payload := payload->'championshipPicks';
    if jsonb_typeof(championship_payload) <> 'object' then
      raise exception 'Version 2 championship picks are invalid';
    end if;

    -- All four P4 conference championship winners are required
    foreach conf in array array['ACC','Big 12','Big Ten','SEC']
    loop
      conf_pick := championship_payload->>conf;
      if conf_pick is null or length(trim(conf_pick)) = 0 then
        raise exception 'Championship winner for % is required', conf;
      end if;
    end loop;
  else
    predictions_payload := payload;
  end if;

  if jsonb_typeof(predictions_payload) <> 'object' then
    raise exception 'Entry predictions must be an object';
  end if;

  -- Server-derived required game count (client-supplied expected_games is ignored)
  select count(*)::integer into required_games
  from public.games where season = target_season;

  if required_games = 0 then
    raise exception 'Season % has no games catalogued yet', target_season;
  end if;

  if jsonb_object_length(predictions_payload) <> required_games then
    raise exception 'Every season game must have a projected winner before submission (% of %)',
      jsonb_object_length(predictions_payload), required_games;
  end if;

  insert into public.ballots (user_id, season, status, submitted_at, draft_payload)
  values (auth.uid(), target_season, 'submitted', now(), payload)
  on conflict (user_id, season) do update
    set status = 'submitted',
        submitted_at = now(),
        draft_payload = excluded.draft_payload
    where ballots.status in ('draft', 'submitted')
  returning * into result;

  if result.id is null then raise exception 'This entry is already locked'; end if;

  delete from public.predictions where ballot_id = result.id;

  for pick in select key, value from jsonb_each(predictions_payload)
  loop
    select * into game_row
    from public.games
    where season = target_season and canonical_key = pick.key;

    if game_row.id is null then
      raise exception 'Schedule game is missing: %', pick.key;
    end if;

    select id into first_id from public.teams where name = pick.value->>'firstTeam';
    select id into second_id from public.teams where name = pick.value->>'secondTeam';
    pct := (pick.value->>'pctForFirstTeam')::numeric;

    if first_id is null or second_id is null or pct is null then
      raise exception 'Invalid prediction for %', pick.key;
    end if;

    if pct > 50 then winner_id := first_id;
    elsif pct < 50 then winner_id := second_id;
    elsif game_row.home_team_id in (first_id, second_id) then
      winner_id := game_row.home_team_id;
    else
      raise exception 'Neutral 50%% game needs a winner: %', pick.key;
    end if;

    insert into public.predictions (
      ballot_id, game_id, predicted_winner_id, win_probability
    )
    values (
      result.id,
      game_row.id,
      winner_id,
      case when winner_id = first_id then pct else 100 - pct end
    );
  end loop;

  return result;
end;
$$;

grant execute on function public.save_entry_draft(jsonb, integer) to authenticated;
grant execute on function public.submit_entry(jsonb, integer, integer) to authenticated;

-- 5. lock_due_entries: cover BOTH draft and submitted, snapshot full locked_payload
create or replace function public.lock_due_entries()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  locked_count integer;
begin
  update public.ballots b
  set status = 'locked',
      locked_at = now(),
      locked_payload = b.draft_payload
  from public.seasons s
  where b.season = s.year
    and b.status in ('draft', 'submitted')
    and s.ballot_deadline is not null
    and now() >= s.ballot_deadline;

  get diagnostics locked_count = row_count;
  return locked_count;
end;
$$;

revoke all on function public.lock_due_entries() from public;
revoke all on function public.lock_due_entries() from anon;
revoke all on function public.lock_due_entries() from authenticated;
grant execute on function public.lock_due_entries() to service_role;
