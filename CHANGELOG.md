# Changelog

## 2026-07-28

- Added a public, read-only 2026 FPI-based benchmark covering all 476 canonical
  games with source attribution, transparent assumptions, and no access to
  private user ballots.
- Upgraded Vite from 5.4.19 to 7.3.6 and refreshed compatible transitive tooling, including Sucrase 3.35.1.
- Reduced the production-only dependency audit from 7 high, 7 moderate, and 0 low findings to 0 high, 5 moderate, and 1 low.
- Passed the complete local and GitHub Actions gates with 72 tests, 13 migration validations, typecheck, lint, and the Vite 7 production build.
- Reconciled the README, roadmap, handoff, known-issues, and validation records for friends-and-family beta onboarding.

## 2026-07-27

- Validated draft and submitted entry restoration across a Surface, iPhone, and iPad, including bidirectional saves, controlled overlapping edits, control-account isolation, and final restoration.
- Added internal-only validation for the post-auth redirect target.
- Completed compatible dependency remediation for React Router, PostCSS, and Recharts' transitive Lodash dependency, reducing the production-only audit from 32 to 14 findings without forced upgrades.
- Completed a read-only CFBD production-readiness inventory; confirmed that no final 2026 games or temporary historical catalog exists and deferred the real import rather than changing production schema solely for testing.
- Approved a proper probability-based Confidence Score as the primary private-group ranking metric and documented its formula, edge cases, UX, data impact, tests, and implementation units.
- Implemented the framework-independent Confidence Score formula and game-weighted aggregation helpers with boundary and full-precision unit coverage.
- Added the forward-only Confidence Score database migration, synchronized Supabase result types, rollback-only SQL fixtures, and CI guards for scoring and private-group security boundaries.
- Added Confidence Score to weekly/season scorecards and private-group standings with game-weighted totals, one-decimal display, benchmark guidance, responsive layouts, and unscored states.
- Published the Confidence Score database and UI together, removed legacy anonymous scorecard-view grants, and verified signed-in production empty states without changing ballots or predictions.

## [Unreleased] — 2026-07-21

### Added

- Lovable Cloud/Supabase schema for profiles, seasons, games, entries, predictions, results, and weekly scorecards
- Google, Apple, and email-link authentication surfaces
- Draft, submitted, reopen-before-deadline, and locked entry lifecycle
- Version 2 cloud payloads containing regular-season and Championship Week selections
- Legacy flat-payload compatibility and Championship Week restoration validation
- Private groups with invite codes, membership RLS, aggregate leaderboards, and OAuth return
- Favorite-team profile preference and personalized default schedule
- Next Team schedule navigation
- Predicted overall and conference wins in standings
- P4 Championship Week derived from conference standings
- Playoff gating until all four championship winners are selected
- My Entry dashboard and persistent site navigation
- CFBD score-sync Edge Function foundation
- Account-isolated browser storage and fresh-account zero state
- Group display names and dedicated owner/member QC coverage
- Ordered cloud-save queue with visible save status and race-condition tests
- Beta operations and entry-recovery runbook

### Changed

- Championship outcomes adjust participant records and determine P4 champion bids
- Championship picks now save through the signed-in cloud entry instead of remaining browser-only
- Mobile navigation uses a compact two-row phone layout
- Review hash links scroll after React rendering
- Account, predictor, and analytics pages expose improved landmark and heading structure
- CI uses Node 22 and gates lint, typecheck, unit tests, migration validation, and production build
- My Entry refreshes after authenticated cloud hydration
- Automatic saves serialize writes and preserve the newest queued payload
- Production now runs the complete private-beta feature set
- Documentation distinguishes feature-branch code, applied migrations, preview state, and production deployment

### Security

- Removed client-side invocation of the global catalog synchronization RPC
- Added a forward-only migration restricting `sync_2026_catalog` to service-role JWTs
- Made `sync-cfbd-scores` fail closed when `SYNC_SECRET` is absent or blank
- Enforced entry deadlines in RPCs and at the ballot write boundary
- Added scheduled locking for draft and submitted entries
- Validated submission completeness and four P4 championship winners server-side
- Repaired PostgreSQL-17 submission counting and added a CI compatibility guard

### Validation

- GitHub Actions run 157 passed lint, typecheck, unit tests, migration validation, and production build
- Lovable production published and reported up to date
- Google OAuth and email-link authentication passed
- Fresh-account zero state and two-account private-group isolation passed
- A 476-game, four-champion entry submitted through the production RPC
- Production automatic save showed saving, saved, revert, and reload behavior without changing the final QC entry

### Known limitations

- True simultaneous-device edits lack server-side conflict detection
- Apple authentication, successful live CFBD ingestion, real weekly scoring, and real-deadline locking remain unvalidated
- Browser end-to-end automation is not configured as a repeatable CI command
- Week-by-week full-slate picking, aggregate fan insights, multiple entries, and a ranked G6 champion are not implemented
- Dependency audit findings require production-impact triage

---

## [1.0.0] — 2026-06-10

### Added

- Shareable projections encoded in the URL
- Copyable forum-post and challenge-link output
- GitHub Pages deployment with SPA fallback
- Host-agnostic Vite base paths
- Clipboard fallback and manually persisted Vegas totals

### Changed

- Removed the Odds API integration because it returned game point totals rather than season win totals
- Updated metadata to use the Lovable application as the primary URL

### Security

- Removed and scrubbed the previously exposed Odds API key; rotation remains the account owner's responsibility
- Made the repository public for GitHub Pages

---

All notable changes to the P4 Oddsmaker are documented here.
