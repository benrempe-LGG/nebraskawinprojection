-- Version cloud entries so Championship Week survives sign-in, devices, and locking.
-- Version 1 stored the regular-season prediction map directly in the payload.

update public.ballots
set draft_payload = jsonb_build_object(
  'version', 2,
  'predictions', draft_payload,
  'championshipPicks', '{}'::jsonb
)
where not (draft_payload ? 'version');

update public.ballots
set locked_payload = jsonb_build_object(
  'version', 2,
  'predictions', locked_payload,
  'championshipPicks', '{}'::jsonb
)
where locked_payload is not null
  and not (locked_payload ? 'version');

create or replace function public.save_entry_draft(
  payload jsonb,
  target_season integer default 2026
)
returns public.ballots
language plpgsql security invoker set search_path = ''
as $$
declare
  result public.ballots;
  predictions_payload jsonb;
  championship_payload jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'Entry payload must be an object';
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

create or replace function public.submit_entry(
  payload jsonb,
  expected_games integer,
  target_season integer default 2026
)
returns public.ballots
language plpgsql security definer set search_path = ''
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
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' then
    raise exception 'Entry payload must be an object';
  end if;

  if payload->>'version' = '2' then
    predictions_payload := payload->'predictions';
    championship_payload := payload->'championshipPicks';
    if jsonb_typeof(championship_payload) <> 'object' then
      raise exception 'Version 2 championship picks are invalid';
    end if;
  else
    predictions_payload := payload;
  end if;

  if jsonb_typeof(predictions_payload) <> 'object'
    or jsonb_object_length(predictions_payload) <> expected_games then
    raise exception 'Every season game must have a projected winner before submission';
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
