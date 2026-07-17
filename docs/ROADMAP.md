# Product Roadmap

Updated: 2026-07-17

## Now — Finish the account integration beta

Goal: prove that the feature branch works against the actual Lovable Cloud database before merging PR #2.

- Apply and verify every migration in `supabase/migrations/`, including `202607170001_profile_favorite_team.sql`.
- Test account creation and return sign-in with Google; verify Apple and email-link flows separately.
- Test draft save, cross-device restore, submit, reopen-before-deadline, and automatic lock behavior.
- Test private-group create, invite, join, leaderboard visibility, and invite regeneration with two accounts.
- Persist Championship Week selections in the cloud entry rather than only localStorage.
- Verify CFBD secret configuration and score synchronization without exposing credentials.
- Run desktop/mobile smoke tests and update the validation record.
- Reconcile PR #2, mark ready, merge, and verify Lovable plus GitHub Pages deployments.

Exit criteria: migrations are confirmed applied, two-account integration flows pass, all entry data survives a second browser, CI is green, and production is smoke-tested after merge.

## Next — Week-by-week full slate

Goal: support chronological picking across the complete tracked P4 slate.

- Add a weekly route using the canonical game catalog.
- Provide conference, picked/unpicked, 50%, and remaining-game filters.
- Synchronize weekly picks with team pages, standings, championships, and playoff projections.
- Show weekly completion and direct navigation to the next unfinished game.
- Prepare scorecards to compare locked picks with final results.

Exit criteria: every canonical matchup appears exactly once in the weekly slate and all existing projections remain consistent.

## Later

- Rank an actual G6 champion instead of reserving an unnamed seed.
- Add official conference tiebreaker procedures.
- Import and maintain preseason win totals from a reliable licensed/free source.
- Add commissioner controls, member removal, group lifecycle, and public groups.
- Add notifications, product analytics, error monitoring, and browser end-to-end tests.
- Calibrate the playoff heuristic with historical committee outcomes.
