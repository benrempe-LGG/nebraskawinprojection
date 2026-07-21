CREATE OR REPLACE FUNCTION public.submit_entry(payload jsonb, expected_games integer, target_season integer DEFAULT 2026)
 RETURNS ballots
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  submitted_count integer;
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

  select count(*)::integer into required_games
  from public.games where season = target_season;

  if required_games = 0 then
    raise exception 'Season % has no games catalogued yet', target_season;
  end if;

  select count(*)::integer into submitted_count
  from jsonb_object_keys(predictions_payload);

  if submitted_count <> required_games then
    raise exception 'Every season game must have a projected winner before submission (% of %)',
      submitted_count, required_games;
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
$function$;