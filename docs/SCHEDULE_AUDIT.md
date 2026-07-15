# 2026 Schedule Audit

Updated: 2026-07-15  
Branch: `feature/season-prediction-foundation`

## Audit rules

For every tracked P4 team:

- Verify opponent, date, home/away, and neutral-site designation against an official conference or school source.
- Require the expected regular-season game count.
- Require each tracked P4-vs-P4 matchup to appear once on both schedules.
- Require matching dates and complementary locations on reciprocal entries.
- Require official conference-game counts.
- Reject duplicate opponents and `TBD` dates.

## Baseline before conference replacement

- 10 teams did not contain 12 games after normalization.
- 50 schedule entries displayed `TBD`.
- Five tracked cross-conference games appeared on only one schedule.
- 20 reciprocal entries had differently formatted or conflicting dates.
- No duplicate normalized conference opponents remained.

## Big 12 — complete

Official source: https://big12sports.com/news/2026/1/21/big-12-conference-announces-2026-football-schedule.aspx and the linked official team schedule pages.

Result:

- All 16 teams have 12 games.
- All 16 teams have nine conference games.
- No Big 12 schedule contains `TBD`.
- Big 12 conference matchups are reciprocal with matching dates and complementary locations.
- Integrity tests enforce these conditions.

## ACC — complete

Official source: https://theacc.com/documents/2026/1/26/2026_ACC_Football_Schedule_Team_by_Team.pdf

Result:

- All 17 teams have complete dated 12-game schedules.
- Twelve teams have nine ACC games; Boston College, Clemson, Florida State, Georgia Tech, and North Carolina have eight.
- No ACC schedule contains `TBD`.
- Every tracked cross-conference game now appears on both schedules.

## Big Ten — complete

Official sources:

- https://bigten.org/fb/article/60083/
- https://bigten.org/fb/article/59999/
- Official school schedule pages where the conference release did not enumerate a nonconference game.

Result:

- All 18 teams have 12 dated games and nine conference games.
- Official Thursday/Friday dates are reflected on both sides of tracked matchups.
- Maryland's opener is correctly listed as Hampton.
- USC's Aug. 29 San Jose State opener and Sept. 4 Fresno State game are included.

## SEC — complete

Official sources:

- https://www.secsports.com/news/2025/09/southeastern-conference-announces-2026-29-football-opponents
- https://www.secsports.com/news/2026/06/espn-announces-remaining-windows-for-2026-sec-football-season
- Current official school schedule pages for all 16 teams.

Result:

- All 16 teams have 12 dated games and nine conference games.
- Opponents, sites, and reciprocal tracked entries match.
- Missouri at Kansas is Sept. 11; Missouri's opener is Thursday, Sept. 3.
- Florida at Florida State is Nov. 27.
- Ole Miss vs. Louisville is Sept. 6.

## Notre Dame — complete

Official source: https://fightingirish.com/sports/football/schedule/

Result:

- All 12 official opponents and dates are represented by the predictor model.
- The ten tracked P4 games align with the opposing team schedules.
- Rice and Navy remain the two assumed non-P4 wins used by the playoff predictor.

## Current automated result

All tracked P4 teams now satisfy:

- exactly 12 games
- no duplicate opponents
- no `TBD` dates
- reciprocal tracked P4 matchups
- matching reciprocal dates after cosmetic weekday-prefix normalization
- complementary home/away or matching neutral designations

## Next checkpoint

Run final release validation and review the draft pull request for merge readiness.
