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

## Big Ten and SEC — structural pass complete, source audit continuing

Every tracked Big Ten and SEC team now has 12 dated games, reciprocal tracked P4 opponents, matching dates, and complementary locations.

Official corrections applied at this checkpoint:

- Added USC's Aug. 29 San Jose State opener and moved Fresno State to Sept. 4 from the official USC schedule.
- Corrected Missouri at Kansas to Sept. 11 from Missouri's official schedule.
- Corrected Florida at Florida State to Nov. 27 using the current official game pages.
- Corrected Ole Miss vs. Louisville to Sept. 6 from both schools' current official releases.

The remaining work is a source-by-source verification of every Big Ten and SEC row, not a known structural repair.

## Notre Dame — pending final source comparison

Notre Dame's 12-game tracked schedule and assumed Rice/Navy wins still require a final comparison against its official current schedule.

## Current automated result

All tracked P4 teams now satisfy:

- exactly 12 games
- no duplicate opponents
- no `TBD` dates
- reciprocal tracked P4 matchups
- matching reciprocal dates after cosmetic weekday-prefix normalization
- complementary home/away or matching neutral designations

## Next checkpoint

Finish the official row-by-row Big Ten, SEC, and Notre Dame comparison, then record final source coverage and run release validation.
