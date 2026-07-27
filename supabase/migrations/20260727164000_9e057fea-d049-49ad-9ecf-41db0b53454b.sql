-- Remove legacy anonymous view privileges while preserving application access.

revoke all privileges on public.weekly_scorecards from public;
revoke all privileges on public.weekly_scorecards from anon;
grant select on public.weekly_scorecards to authenticated;
grant all on public.weekly_scorecards to service_role;
