create function public.lock_due_entries()
returns integer
language plpgsql security definer set search_path = ''
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
    and b.status = 'submitted'
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