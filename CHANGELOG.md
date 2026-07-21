# Changelog

## [Unreleased] — 2026-07-20

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

### Changed

- Championship outcomes adjust participant records and determine P4 champion bids
- Championship picks now save through the signed-in cloud entry instead of remaining browser-only
- Mobile navigation uses a compact two-row phone layout
- Review hash links scroll after React rendering
- Account, predictor, and analytics pages expose improved landmark and heading structure
- CI uses Node 22 and validates tests plus production build
- Documentation distinguishes feature-branch code, applied migrations, preview state, and production deployment

### Validation

- GitHub Actions run 132 passed for feature head `aeb8ad9`
- Lovable reported all 22 tests and the production build passing
- Desktop, 390-pixel phone navigation, review anchoring, route guards, and page landmarks passed preview QC

### Known limitations

- Final July 20 corrections remain unpublished in production
- Lovable migration history and duplicate versioned-payload migration files require reconciliation
- Two-account groups, cross-device locked restore, Apple/email auth, CFBD sync, automatic locking, and real weekly scoring remain incompletely validated
- The CFBD sync endpoint does not fail closed when `SYNC_SECRET` is absent
- Week-by-week full-slate picking and a ranked G6 champion are not implemented

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
