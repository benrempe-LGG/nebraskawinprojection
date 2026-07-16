-- Private prediction groups, invite codes, and member leaderboards

create type public.group_role as enum ('owner', 'member');

create table public.prediction_groups (
  id uuid primary key default gen_random_uuid(),
  season integer not null references public.seasons(year) on delete cascade,
  name text not null check (char_length(trim(name)) between 2 and 60),
  owner_id uuid not null references auth.users(id) on delete cascade,
  invite_code text not null unique default upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.group_members (
  group_id uuid not null references public.prediction_groups(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.group_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_idx on public.group_members(user_id);
create index prediction_groups_owner_idx on public.prediction_groups(owner_id);

create trigger prediction_groups_updated_at
before update on public.prediction_groups
for each row execute function public.set_updated_at();

create function public.is_group_member(target_group uuid, target_user uuid default auth.uid())
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.group_members
    where group_id = target_group and user_id = target_user
  );
$$;

create function public.create_private_group(group_name text, target_season integer default 2026)
returns public.prediction_groups
language plpgsql security definer set search_path = ''
as $$
declare
  new_group public.prediction_groups;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if char_length(trim(group_name)) not between 2 and 60 then
    raise exception 'Group name must be between 2 and 60 characters';
  end if;

  insert into public.prediction_groups (season, name, owner_id)
  values (target_season, trim(group_name), auth.uid())
  returning * into new_group;

  insert into public.group_members (group_id, user_id, role)
  values (new_group.id, auth.uid(), 'owner');

  return new_group;
end;
$$;

create function public.join_private_group(code text)
returns public.prediction_groups
language plpgsql security definer set search_path = ''
as $$
declare
  target public.prediction_groups;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;

  select * into target
  from public.prediction_groups
  where invite_code = upper(trim(code));

  if target.id is null then raise exception 'Invite code not found'; end if;

  insert into public.group_members (group_id, user_id, role)
  values (target.id, auth.uid(), 'member')
  on conflict (group_id, user_id) do nothing;

  return target;
end;
$$;

create function public.regenerate_group_invite(target_group uuid)
returns text
language plpgsql security definer set search_path = ''
as $$
declare
  next_code text;
begin
  if not exists (
    select 1 from public.prediction_groups
    where id = target_group and owner_id = auth.uid()
  ) then raise exception 'Only the group owner can regenerate its invite code'; end if;

  next_code := upper(substr(encode(gen_random_bytes(8), 'hex'), 1, 8));
  update public.prediction_groups set invite_code = next_code where id = target_group;
  return next_code;
end;
$$;

create view public.group_leaderboard
with (security_invoker = true) as
select
  gm.group_id,
  gm.user_id,
  coalesce(p.display_name, 'Anonymous') as display_name,
  gm.role,
  count(distinct ws.week)::integer as weeks_scored,
  coalesce(sum(ws.games_final), 0)::integer as games_final,
  coalesce(sum(ws.correct_picks), 0)::integer as correct_picks,
  case
    when coalesce(sum(ws.games_final), 0) = 0 then 0
    else round(100.0 * sum(ws.correct_picks) / sum(ws.games_final), 1)
  end as accuracy
from public.group_members gm
join public.prediction_groups pg on pg.id = gm.group_id
left join public.profiles p on p.id = gm.user_id
left join public.weekly_scorecards ws
  on ws.user_id = gm.user_id and ws.season = pg.season
group by gm.group_id, gm.user_id, p.display_name, gm.role;

alter table public.prediction_groups enable row level security;
alter table public.group_members enable row level security;

create policy "Members can read their groups" on public.prediction_groups
for select using (public.is_group_member(id));

create policy "Owners can update their groups" on public.prediction_groups
for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "Members can read fellow members" on public.group_members
for select using (public.is_group_member(group_id));

create policy "Members can leave groups" on public.group_members
for delete using (user_id = auth.uid() and role = 'member');

create policy "Owners can remove members" on public.group_members
for delete using (
  role = 'member' and exists (
    select 1 from public.prediction_groups
    where id = group_id and owner_id = auth.uid()
  )
);

grant execute on function public.create_private_group(text, integer) to authenticated;
grant execute on function public.join_private_group(text) to authenticated;
grant execute on function public.regenerate_group_invite(uuid) to authenticated;

-- The leaderboard joins private profile and scorecard data. Restrict rows to group members.
create policy "Group members can read member profiles" on public.profiles
for select using (
  auth.uid() = id or is_public or exists (
    select 1 from public.group_members mine
    join public.group_members theirs on theirs.group_id = mine.group_id
    where mine.user_id = auth.uid() and theirs.user_id = profiles.id
  )
);
