# Product Roadmap

Updated: 2026-07-21

## Now — Prove the private beta

Goal: observe real friends-and-family usage without risking entries or expanding scope before PR #2 is ready.

- Have 3 to 10 users complete Google or email sign-in, favorite-team setup, a full entry, Championship Week, submission, and private-group join.
- Record feedback with page, browser, device, and reproduction steps.
- Test draft and submitted restore on two genuinely separate devices.
- Verify that editing on one device appears on the other after refresh.
- Decide whether server-side optimistic concurrency or immutable ballot revisions are required before broader launch.
- Keep Apple login unadvertised until configured and validated.
- Keep the one-entry-per-account rule during beta.
- Preserve production through the safeguards in `docs/BETA_OPERATIONS.md`.

Exit criteria: no unexplained entry loss, group invitations work for real users, cloud state survives device changes, all beta blockers are closed or explicitly accepted, production smoke testing passes, and CI remains green.

## Next — Complete live scoring and merge

Goal: turn locked preseason entries into reliable weekly competition and finish PR #2.

- Publish the implemented Confidence Scoring calculation, database, and UI
  units as one controlled release, then complete production validation after
  real final results exist. See [Confidence Scoring](CONFIDENCE_SCORING.md).
- Run one controlled successful CFBD import after the first 2026 final and verify canonical/reversed matching, aliases, unmatched games, and idempotency against production-safe fixtures.
- Populate and validate weekly scorecards from locked entries and final results.
- Validate scheduled locking with a temporary test season without changing the real 2026 deadline.
- Decide the supported Apple authentication path or remove its UI.
- Address actionable beta findings and dependency-audit risk.
- Mark PR #2 ready, merge to `main`, and verify Lovable plus GitHub Pages.

Exit criteria: scores populate correctly, locked entries cannot change, scorecards agree with known results, supported authentication paths are documented, CI passes, and both production surfaces pass post-merge smoke tests.

## Then — Week-by-week full slate

Goal: support chronological picking across the complete tracked P4 slate.

- Add a weekly route using the canonical game catalog.
- Provide conference, picked/unpicked, 50%, and remaining-game filters.
- Synchronize weekly picks with team pages, standings, Championship Week, and playoff projections.
- Show weekly completion and direct navigation to the next unfinished game.
- Integrate actual results and weekly scoring views.

Exit criteria: every canonical matchup appears exactly once in the weekly slate and all projections remain consistent with team-by-team entry.

## Later

- Add privacy-safe aggregate prediction insights, including own-team fan cohorts and bias analysis.
- Add multiple named entries per account only after group scoring and entry identity are redesigned.
- Rank an actual G6 champion instead of reserving an unnamed seed.
- Add official conference tiebreaker procedures.
- Import and maintain preseason win totals from a reliable licensed or free source.
- Add commissioner controls, member removal, ownership transfer, group lifecycle, and public groups.
- Add production error monitoring, product analytics, feedback capture, and browser end-to-end CI.
- Calibrate the playoff heuristic with historical committee outcomes.
