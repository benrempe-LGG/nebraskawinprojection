-- Add probability-quality scoring to locked weekly scorecards and private groups.

create or replace view public.weekly_scorecards
with (security_invoker = true) as
select
  b.user_id,
  b.id as ballot_id,
  b.season,
  g.week,
  count(*) filter (
    where g.status = 'final'
      and g.home_score <> g.away_score
  )::integer as games_final,
  count(*) filter (
    where g.status = 'final'
      and g.home_score <> g.away_score
      and p.predicted_winner_id =
        case when g.home_score > g.away_score then g.home_team_id else g.away_team_id end
  )::integer as correct_picks,
  count(*) filter (
    where g.status = 'final'
      and g.home_score <> g.away_score
      and p.predicted_winner_id <>
        case when g.home_score > g.away_score then g.home_team_id else g.away_team_id end
  )::integer as incorrect_picks,
  count(*) filter (
    where g.status = 'final'
      and g.home_score <> g.away_score
      and p.win_probability is not null
  )::integer as confidence_games,
  avg(
    100::numeric * (
      1 - power(
        p.win_probability / 100::numeric
        - case
            when p.predicted_winner_id =
              case when g.home_score > g.away_score then g.home_team_id else g.away_team_id end
            then 1::numeric
            else 0::numeric
          end,
        2
      )
    )
  ) filter (
    where g.status = 'final'
      and g.home_score <> g.away_score
      and p.win_probability is not null
  ) as confidence_score
from public.ballots b
join public.predictions p on p.ballot_id = b.id
join public.games g on g.id = p.game_id
where b.status = 'locked'
group by b.user_id, b.id, b.season, g.week;

grant select on public.weekly_scorecards to authenticated;
grant all on public.weekly_scorecards to service_role;

drop function public.get_group_leaderboard(uuid);

create function public.get_group_leaderboard(target_group uuid)
returns table (
  user_id uuid,
  display_name text,
  role public.group_role,
  weeks_scored integer,
  games_final integer,
  correct_picks integer,
  accuracy numeric,
  confidence_games integer,
  confidence_score numeric
)
language plpgsql stable security definer set search_path = ''
as $$
begin
  if not public.is_group_member(target_group) then
    raise exception 'Group membership required';
  end if;

  return query
  with member_scores as (
    select
      gm.user_id,
      coalesce(p.display_name, 'Anonymous')::text as display_name,
      gm.role,
      count(distinct ws.week) filter (where ws.games_final > 0)::integer as weeks_scored,
      coalesce(sum(ws.games_final), 0)::integer as games_final,
      coalesce(sum(ws.correct_picks), 0)::integer as correct_picks,
      case
        when coalesce(sum(ws.games_final), 0) = 0 then 0::numeric
        else 100::numeric * sum(ws.correct_picks) / sum(ws.games_final)
      end as accuracy,
      coalesce(sum(ws.confidence_games), 0)::integer as confidence_games,
      case
        when coalesce(sum(ws.confidence_games), 0) = 0 then null::numeric
        else
          sum(ws.confidence_score * ws.confidence_games)
          / sum(ws.confidence_games)
      end as confidence_score
    from public.group_members gm
    join public.prediction_groups pg on pg.id = gm.group_id
    left join public.profiles p on p.id = gm.user_id
    left join public.weekly_scorecards ws
      on ws.user_id = gm.user_id and ws.season = pg.season
    where gm.group_id = target_group
    group by gm.user_id, p.display_name, gm.role
  )
  select
    member_scores.user_id,
    member_scores.display_name,
    member_scores.role,
    member_scores.weeks_scored,
    member_scores.games_final,
    member_scores.correct_picks,
    member_scores.accuracy,
    member_scores.confidence_games,
    member_scores.confidence_score
  from member_scores
  order by member_scores.confidence_score desc nulls last,
           member_scores.correct_picks desc,
           member_scores.display_name asc;
end;
$$;

revoke all privileges on function public.get_group_leaderboard(uuid) from public;
revoke all privileges on function public.get_group_leaderboard(uuid) from anon;
grant execute on function public.get_group_leaderboard(uuid) to authenticated;
grant execute on function public.get_group_leaderboard(uuid) to service_role;

comment on function public.get_group_leaderboard(uuid) is
  'Member-only private-group standings ranked by unrounded game-weighted Confidence Score.';
