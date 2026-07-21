# Product Roadmap

Updated: 2026-07-20

## Now — Close the account integration beta

Goal: prove that the current feature branch, Lovable database, and production deployment behave as one coherent product before merging PR #2.

- Reconcile the Lovable migration ledger, including the manual and Lovable-generated copies of the versioned Championship Week payload migration.
- Publish the validated July 20 preview corrections to production and repeat the production smoke test.
- Test draft save, Championship Week save, cross-device restore, submit, reopen-before-deadline, and locked-payload restore.
- Test private-group create, invite, OAuth return, join, invite regeneration, and leaderboard visibility with two accounts.
- Make the CFBD score-sync endpoint fail closed when `SYNC_SECRET` is missing, then validate secret configuration and score ingestion.
- Validate Apple and email-link authentication separately from the working Google flow.
- Update PR #2, mark ready, merge, and verify Lovable plus GitHub Pages deployments.

Exit criteria: the migration ledger is known, two-account and cross-device flows pass, a locked version 2 entry restores both prediction layers, score sync is protected and demonstrated, the latest production smoke test passes, and CI remains green.

## Next — Week-by-week full slate

Goal: support chronological picking across the complete tracked P4 slate.

- Add a weekly route using the canonical game catalog.
- Provide conference, picked/unpicked, 50%, and remaining-game filters.
- Synchronize weekly picks with team pages, standings, Championship Week, and playoff projections.
- Show weekly completion and direct navigation to the next unfinished game.
- Populate scorecards from locked picks and final results.

Exit criteria: every canonical matchup appears exactly once in the weekly slate and all existing projections remain consistent.

## Later

- Rank an actual G6 champion instead of reserving an unnamed seed.
- Add official conference tiebreaker procedures.
- Import and maintain preseason win totals from a reliable licensed or free source.
- Add commissioner controls, member removal, group lifecycle, and public groups.
- Add notifications, product analytics, error monitoring, and browser end-to-end tests.
- Calibrate the playoff heuristic with historical committee outcomes.
