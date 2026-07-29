-- March Madness-style entry lifecycle: draft -> submitted -> locked.

alter table public.ballots drop constraint lock_state_consistent;
alter table public.ballots
  add column if not exists draft_payload jsonb not null default '{}'::jsonb,
  add column if not exists locked_payload jsonb,
  add column if not exists submitted_at timestamptz,
  add constraint lock_state_consistent check (
    (status in ('draft', 'submitted') and locked_at is null) or
    (status = 'locked' and locked_at is not null)
  );

drop policy if exists "Users can update own draft ballots" on public.ballots;
create policy "Users can update own editable entries" on public.ballots
for update using (auth.uid() = user_id and status in ('draft', 'submitted'))
with check (auth.uid() = user_id and status in ('draft', 'submitted'));

create function public.save_entry_draft(payload jsonb, target_season integer default 2026)
returns public.ballots
language plpgsql security invoker set search_path = ''
as $$
declare
  result public.ballots;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' then raise exception 'Entry payload must be an object'; end if;

  insert into public.ballots (user_id, season, status, draft_payload)
  values (auth.uid(), target_season, 'draft', payload)
  on conflict (user_id, season) do update
    set draft_payload = excluded.draft_payload
    where ballots.status in ('draft', 'submitted')
  returning * into result;

  if result.id is null then raise exception 'This entry is locked and cannot be changed'; end if;
  return result;
end;
$$;

create function public.submit_entry(payload jsonb, expected_games integer, target_season integer default 2026)
returns public.ballots
language plpgsql security invoker set search_path = ''
as $$
declare
  result public.ballots;
begin
  if auth.uid() is null then raise exception 'Sign in required'; end if;
  if jsonb_typeof(payload) <> 'object' or jsonb_object_length(payload) <> expected_games then
    raise exception 'Every season game must have a projected winner before submission';
  end if;

  insert into public.ballots (
    user_id, season, status, submitted_at, draft_payload
  )
  values (
    auth.uid(), target_season, 'submitted', now(), payload
  )
  on conflict (user_id, season) do update
    set status = 'submitted',
        submitted_at = now(),
        draft_payload = excluded.draft_payload
    where ballots.status in ('draft', 'submitted')
  returning * into result;

  if result.id is null then raise exception 'This entry is already locked'; end if;
  return result;
end;
$$;

create function public.reopen_entry(target_season integer default 2026)
returns public.ballots
language plpgsql security invoker set search_path = ''
as $$
declare
  result public.ballots;
  deadline timestamptz;
begin
  select ballot_deadline into deadline from public.seasons where year = target_season;
  if deadline is not null and now() >= deadline then
    raise exception 'The entry deadline has passed';
  end if;

  update public.ballots
  set status = 'draft', submitted_at = null
  where user_id = auth.uid() and season = target_season and status = 'submitted'
  returning * into result;

  if result.id is null then raise exception 'Submitted entry not found'; end if;
  return result;
end;
$$;

grant execute on function public.save_entry_draft(jsonb, integer) to authenticated;
grant execute on function public.submit_entry(jsonb, integer, integer) to authenticated;
grant execute on function public.reopen_entry(integer) to authenticated;