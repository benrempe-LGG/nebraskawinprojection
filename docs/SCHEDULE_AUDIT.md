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

## ACC — in progress

The official opponent matrix is installed, including the transition-year split of twelve nine-game teams and five eight-game teams.

Remaining at this checkpoint:

- 14 reciprocal schedule entries still display `TBD` across seven ACC matchups.
- Florida State, NC State, and Pittsburgh contain 11 games.
- North Carolina contains nine games.
- Vanderbilt lists NC State, but NC State does not yet list Vanderbilt.
- Colorado lists Georgia Tech, but Georgia Tech does not yet list Colorado.

## Big Ten, SEC, and Notre Dame — pending source audit

Known baseline item: USC currently contains 11 games. Nebraska weekday prefixes differ cosmetically from reciprocal entries but represent the same dates. Missouri-Kansas requires confirmation because the current sources differ by one day.

## Next checkpoint

Replace the ACC with complete official dated schedules, rerun the audit, then verify Big Ten, SEC, Notre Dame, and every cross-conference P4 matchup.
