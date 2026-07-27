-- Run against a disposable database after all migrations. The transaction
-- rolls back every fixture. Any failed assertion aborts the script.

begin;

insert into auth.users (id, email, aud, role)
values
  ('10000000-0000-0000-0000-000000000001', 'confidence-alpha@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000002', 'confidence-beta@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000003', 'confidence-gamma@example.test', 'authenticated', 'authenticated'),
  ('10000000-0000-0000-0000-000000000004', 'confidence-outsider@example.test', 'authenticated', 'authenticated');

update public.profiles
set display_name = case id
  when '10000000-0000-0000-0000-000000000001' then 'Alpha'
  when '10000000-0000-0000-0000-000000000002' then 'Beta'
  when '10000000-0000-0000-0000-000000000003' then 'Gamma'
  else 'Outsider'
end
where id::text like '10000000-0000-0000-0000-00000000000%';

insert into public.seasons (year, name, ballot_deadline)
values (2099, 'Confidence fixture', '2100-01-01T00:00:00Z');

insert into public.teams (id, slug, name)
values
  ('20000000-0000-0000-0000-000000000001', 'fixture-one', 'Fixture One'),
  ('20000000-0000-0000-0000-000000000002', 'fixture-two', 'Fixture Two'),
  ('20000000-0000-0000-0000-000000000003', 'fixture-three', 'Fixture Three'),
  ('20000000-0000-0000-0000-000000000004', 'fixture-four', 'Fixture Four'),
  ('20000000-0000-0000-0000-000000000005', 'fixture-five', 'Fixture Five'),
  ('20000000-0000-0000-0000-000000000006', 'fixture-six', 'Fixture Six'),
  ('20000000-0000-0000-0000-000000000007', 'fixture-seven', 'Fixture Seven'),
  ('20000000-0000-0000-0000-000000000008', 'fixture-eight', 'Fixture Eight'),
  ('20000000-0000-0000-0000-000000000009', 'fixture-nine', 'Fixture Nine'),
  ('20000000-0000-0000-0000-000000000010', 'fixture-ten', 'Fixture Ten');

insert into public.games (
  id, season, week, home_team_id, away_team_id, status, home_score, away_score
)
values
  ('30000000-0000-0000-0000-000000000001', 2099, 1, '20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000002', 'final', 24, 17),
  ('30000000-0000-0000-0000-000000000002', 2099, 1, '20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000004', 'final', 10, 20),
  ('30000000-0000-0000-0000-000000000003', 2099, 1, '20000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000006', 'final', 14, 14),
  ('30000000-0000-0000-0000-000000000004', 2099, 1, '20000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000008', 'scheduled', null, null),
  ('30000000-0000-0000-0000-000000000005', 2099, 2, '20000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000010', 'final', 31, 7),
  ('30000000-0000-0000-0000-000000000006', 2099, 1, '20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'in_progress', 7, 3),
  ('30000000-0000-0000-0000-000000000007', 2099, 1, '20000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000003', 'postponed', null, null),
  ('30000000-0000-0000-0000-000000000008', 2099, 1, '20000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005', 'canceled', null, null);

insert into public.ballots (id, user_id, season)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 2099),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 2099),
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 2099),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 2099);

-- Alpha: 80% correct (96), 80% incorrect (36), tied/scheduled excluded,
-- and 100% correct (100). Season score = 232 / 3 = 77.333...
insert into public.predictions (ballot_id, game_id, predicted_winner_id, win_probability)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 80),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', 80),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005', 90),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000007', 90),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000009', 100),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', 90),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000004', 90),
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000006', 90),
  -- Beta and Gamma tie at 75; Gamma has one additional correct pick with null confidence.
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 50),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 50),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000009', null),
  -- This prediction remains on a draft ballot and must never produce a scorecard.
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 100);

update public.ballots
set status = 'locked', locked_at = now(), locked_payload = draft_payload
where id <> '40000000-0000-0000-0000-000000000004';

insert into public.prediction_groups (id, season, name, owner_id, invite_code)
values (
  '50000000-0000-0000-0000-000000000001',
  2099,
  'Confidence fixture group',
  '10000000-0000-0000-0000-000000000001',
  'CONF2099'
);

insert into public.group_members (group_id, user_id, role)
values
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'owner'),
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'member'),
  ('50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 'member');

do $$
declare
  week_one public.weekly_scorecards;
  season_score numeric;
  ordered_names text[];
begin
  select * into week_one
  from public.weekly_scorecards
  where ballot_id = '40000000-0000-0000-0000-000000000001' and week = 1;

  if week_one.games_final <> 2
    or week_one.correct_picks <> 1
    or week_one.incorrect_picks <> 1
    or week_one.confidence_games <> 2
    or abs(week_one.confidence_score - 66::numeric) > 0.000000001 then
    raise exception 'Weekly confidence fixture failed: %', row_to_json(week_one);
  end if;

  if exists (
    select 1 from public.weekly_scorecards
    where ballot_id = '40000000-0000-0000-0000-000000000004'
  ) then
    raise exception 'Draft ballot produced a scorecard';
  end if;

  perform set_config(
    'request.jwt.claim.sub',
    '10000000-0000-0000-0000-000000000001',
    true
  );

  select confidence_score into season_score
  from public.get_group_leaderboard('50000000-0000-0000-0000-000000000001')
  where display_name = 'Alpha';

  if abs(season_score - (232::numeric / 3)) > 0.000000001 then
    raise exception 'Game-weighted season confidence fixture failed: %', season_score;
  end if;

  select array_agg(display_name) into ordered_names
  from public.get_group_leaderboard('50000000-0000-0000-0000-000000000001');

  if ordered_names <> array['Alpha', 'Gamma', 'Beta']::text[] then
    raise exception 'Confidence ranking fixture failed: %', ordered_names;
  end if;
end;
$$;

do $$
declare
  corrected_score numeric;
begin
  update public.games
  set home_score = 17, away_score = 24
  where id = '30000000-0000-0000-0000-000000000001';

  select confidence_score into corrected_score
  from public.weekly_scorecards
  where ballot_id = '40000000-0000-0000-0000-000000000001' and week = 1;

  if abs(corrected_score - 36::numeric) > 0.000000001 then
    raise exception 'Corrected-result recomputation fixture failed: %', corrected_score;
  end if;
end;
$$;

do $$
begin
  perform set_config(
    'request.jwt.claim.sub',
    '10000000-0000-0000-0000-000000000004',
    true
  );
  perform public.get_group_leaderboard('50000000-0000-0000-0000-000000000001');
  raise exception 'Non-member leaderboard access was not rejected';
exception
  when others then
    if sqlerrm <> 'Group membership required' then
      raise;
    end if;
end;
$$;

rollback;
