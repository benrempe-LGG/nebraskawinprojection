-- Secure RPC for reading a private group's aggregate leaderboard.
create function public.get_group_leaderboard(target_group uuid)
returns table (
  user_id uuid,
  display_name text,
  role public.group_role,
  weeks_scored integer,
  games_final integer,
  correct_picks integer,
  accuracy numeric
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_group_member(target_group) then
    raise exception 'Group membership required';
  end if;

  return query
  select
    gm.user_id,
    coalesce(p.display_name, 'Anonymous')::text,
    gm.role,
    count(distinct ws.week)::integer,
    coalesce(sum(ws.games_final), 0)::integer,
    coalesce(sum(ws.correct_picks), 0)::integer,
    case
      when coalesce(sum(ws.games_final), 0) = 0 then 0::numeric
      else round(100.0 * sum(ws.correct_picks) / sum(ws.games_final), 1)
    end
  from public.group_members gm
  join public.prediction_groups pg on pg.id = gm.group_id
  left join public.profiles p on p.id = gm.user_id
  left join public.weekly_scorecards ws
    on ws.user_id = gm.user_id and ws.season = pg.season
  where gm.group_id = target_group
  group by gm.user_id, p.display_name, gm.role
  order by coalesce(sum(ws.correct_picks), 0) desc,
           case when coalesce(sum(ws.games_final), 0) = 0 then 0
                else 1.0 * sum(ws.correct_picks) / sum(ws.games_final) end desc,
           coalesce(p.display_name, 'Anonymous');
end;
$$;

grant execute on function public.get_group_leaderboard(uuid) to authenticated;