-- Accounts, locked ballots, results, and weekly scorecards foundation

create extension if not exists pgcrypto;

create type public.ballot_status as enum ('draft', 'locked');
create type public.game_status as enum ('scheduled', 'in_progress', 'final', 'postponed', 'canceled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.seasons (
  year integer primary key check (year between 2026 and 2100),
  name text not null,
  ballot_deadline timestamptz,
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.teams (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  conference text,
  cfbd_team text unique,
  created_at timestamptz not null default now()
);

create table public.games (
  id uuid primary key default gen_random_uuid(),
  season integer not null references public.seasons(year) on delete restrict,
  week integer not null check (week between 0 and 20),
  kickoff_at timestamptz,
  home_team_id uuid not null references public.teams(id),
  away_team_id uuid not null references public.teams(id),
  neutral_site boolean not null default false,
  venue text,
  cfbd_game_id bigint unique,
  status public.game_status not null default 'scheduled',
  home_score integer check (home_score is null or home_score >= 0),
  away_score integer check (away_score is null or away_score >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint different_teams check (home_team_id <> away_team_id),
  constraint final_has_scores check (
    status <> 'final' or (home_score is not null and away_score is not null)
  ),
  unique (season, home_team_id, away_team_id)
);

create table public.ballots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  season integer not null references public.seasons(year) on delete restrict,
  status public.ballot_status not null default 'draft',
  locked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lock_state_consistent check (
    (status = 'draft' and locked_at is null) or
    (status = 'locked' and locked_at is not null)
  ),
  unique (user_id, season)
);

create table public.predictions (
  id uuid primary key default gen_random_uuid(),
  ballot_id uuid not null references public.ballots(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  predicted_winner_id uuid not null references public.teams(id),
  win_probability numeric(5,2) check (
    win_probability is null or win_probability between 0 and 100
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (ballot_id, game_id)
);

create index games_season_week_idx on public.games(season, week);
create index predictions_ballot_idx on public.predictions(ballot_id);
create index ballots_user_idx on public.ballots(user_id);

create function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger games_updated_at before update on public.games
for each row execute function public.set_updated_at();
create trigger ballots_updated_at before update on public.ballots
for each row execute function public.set_updated_at();
create trigger predictions_updated_at before update on public.predictions
for each row execute function public.set_updated_at();

create function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create function public.validate_prediction()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare
  ballot_row public.ballots;
  game_row public.games;
begin
  select * into ballot_row from public.ballots where id = new.ballot_id;
  if ballot_row.status = 'locked' then
    raise exception 'Locked ballots cannot be changed';
  end if;

  select * into game_row from public.games where id = new.game_id;
  if game_row.season <> ballot_row.season then
    raise exception 'Prediction game and ballot seasons must match';
  end if;
  if new.predicted_winner_id not in (game_row.home_team_id, game_row.away_team_id) then
    raise exception 'Predicted winner must participate in the game';
  end if;
  return new;
end;
$$;

create trigger validate_prediction_write
before insert or update on public.predictions
for each row execute function public.validate_prediction();

create function public.prevent_locked_prediction_delete()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists (
    select 1 from public.ballots
    where id = old.ballot_id and status = 'locked'
  ) then
    raise exception 'Locked ballots cannot be changed';
  end if;
  return old;
end;
$$;

create trigger prevent_locked_prediction_delete
before delete on public.predictions
for each row execute function public.prevent_locked_prediction_delete();

create function public.lock_ballot(target_ballot uuid)
returns public.ballots
language plpgsql security invoker set search_path = '' as $$
declare
  result public.ballots;
  required_games integer;
  completed_predictions integer;
begin
  select count(*) into required_games
  from public.games g
  join public.ballots b on b.id = target_ballot and b.season = g.season;

  select count(*) into completed_predictions
  from public.predictions where ballot_id = target_ballot;

  if required_games = 0 or completed_predictions <> required_games then
    raise exception 'Every season game must have a prediction before locking';
  end if;

  update public.ballots
  set status = 'locked', locked_at = now()
  where id = target_ballot
    and user_id = auth.uid()
    and status = 'draft'
  returning * into result;

  if result.id is null then
    raise exception 'Draft ballot not found';
  end if;
  return result;
end;
$$;

create view public.weekly_scorecards
with (security_invoker = true) as
select
  b.user_id,
  b.id as ballot_id,
  b.season,
  g.week,
  count(*) filter (where g.status = 'final')::integer as games_final,
  count(*) filter (
    where g.status = 'final'
      and p.predicted_winner_id =
        case when g.home_score > g.away_score then g.home_team_id else g.away_team_id end
  )::integer as correct_picks,
  count(*) filter (
    where g.status = 'final'
      and p.predicted_winner_id <>
        case when g.home_score > g.away_score then g.home_team_id else g.away_team_id end
  )::integer as incorrect_picks
from public.ballots b
join public.predictions p on p.ballot_id = b.id
join public.games g on g.id = p.game_id
where b.status = 'locked'
group by b.user_id, b.id, b.season, g.week;

alter table public.profiles enable row level security;
alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.games enable row level security;
alter table public.ballots enable row level security;
alter table public.predictions enable row level security;

create policy "Public can read seasons" on public.seasons for select using (true);
create policy "Public can read teams" on public.teams for select using (true);
create policy "Public can read games and results" on public.games for select using (true);

create policy "Users can read own profile" on public.profiles
for select using (auth.uid() = id or is_public);
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can read own ballots" on public.ballots
for select using (auth.uid() = user_id);
create policy "Users can create own ballots" on public.ballots
for insert with check (auth.uid() = user_id and status = 'draft');
create policy "Users can update own draft ballots" on public.ballots
for update using (auth.uid() = user_id and status = 'draft')
with check (auth.uid() = user_id);

create policy "Users can read own predictions" on public.predictions
for select using (
  exists (select 1 from public.ballots b where b.id = ballot_id and b.user_id = auth.uid())
);
create policy "Users can create draft predictions" on public.predictions
for insert with check (
  exists (
    select 1 from public.ballots b
    where b.id = ballot_id and b.user_id = auth.uid() and b.status = 'draft'
  )
);
create policy "Users can update draft predictions" on public.predictions
for update using (
  exists (
    select 1 from public.ballots b
    where b.id = ballot_id and b.user_id = auth.uid() and b.status = 'draft'
  )
) with check (
  exists (
    select 1 from public.ballots b
    where b.id = ballot_id and b.user_id = auth.uid() and b.status = 'draft'
  )
);
create policy "Users can delete draft predictions" on public.predictions
for delete using (
  exists (
    select 1 from public.ballots b
    where b.id = ballot_id and b.user_id = auth.uid() and b.status = 'draft'
  )
);

insert into public.seasons (year, name, is_active)
values (2026, '2026 College Football Season', true)
on conflict (year) do nothing;
