# Changelog

## [Unreleased] — 2026-07-17

### Added

- Lovable Cloud/Supabase schema for profiles, seasons, games, entries, predictions, results, and weekly scorecards
- Google, Apple, and email-link authentication surfaces
- Draft, submitted, reopen-before-deadline, and locked entry lifecycle
- Cloud entry restore and scoreable canonical game catalog foundations
- Private groups with invite codes, membership RLS, aggregate leaderboards, and OAuth return
- Favorite-team profile preference and personalized default schedule
- Next Team schedule navigation
- Predicted overall and conference wins in standings
- P4 Championship Week derived from conference standings
- Playoff gating until all four championship winners are selected
- CFBD score-sync Edge Function foundation

### Changed

- Championship outcomes now adjust participant records and determine P4 champion bids
- The account milestone uses Lovable's native Supabase-compatible backend
- CI uses Node 22 and validates tests plus production build
- Project documentation now distinguishes feature-branch code, applied migrations, preview state, and production deployment

### Known limitations

- Championship selections remain browser-local and are not included in the cloud entry payload
- Lovable migration state and two-account group behavior require recorded live verification
- Apple/email authentication, CFBD score sync, automatic deadline locking, and cross-device restore remain incompletely validated
- Week-by-week full-slate picking and a ranked G6 champion are not implemented

---

All notable changes to the P4 Oddsmaker are documented here.

## [1.0.0] — 2026-06-10

### Added

- **Shareable Projections**: Encode team, per-game win %, and Vegas total into the URL. Share a link like `?t=Nebraska&p=90,85,95,...&v=6.5` to let others see your exact picks and post their own back. Drops users straight into pre-filled form for instant comparison.

- **Copy Forum Post Button**: Generate a paste-ready text breakdown for message boards. Output includes:
  - Headline with your expected win total
  - Over/under lean vs. Vegas (if all games filled in)
  - Full game-by-game list with your win % for each
  - Projected record (wins–losses) and conference wins
  - Bowl eligibility odds
  - Challenge link at the bottom

- **GitHub Pages Deployment**: Automatic CI/CD via GitHub Actions. Push to main branch → build runs → artifacts deployed to https://benrempe-lgg.github.io/nebraskawinprojection/ within 2 minutes. Includes SPA fallback (404.html) so `/analytics` route works.

- **Host-Agnostic Build Path**: Vite reads `DEPLOY_BASE_PATH` env var. GitHub Pages build sets it to `/nebraskawinprojection/`; Lovable build defaults to `/`. Same codebase, different deployment paths.

- **Clipboard Fallback**: Users on browsers that block the Clipboard API see a fallback using `execCommand('copy')` instead of throwing an error.

- **Vegas Total Persistence**: Manual entry field (no longer fetches from Odds API). Saves per team in localStorage, so switching teams doesn't lose your lines.

### Changed

- **Removed Odds API Integration**: The `/src/lib/vegasApi.ts` file (containing a leaked API key) was deleted and scrubbed from all git history. Vegas season win totals are now entered manually—more reliable anyway, since the API was returning game point totals, not season totals.

- **Updated Metadata**: OG tags and README now point to https://nebraskawinprojection.lovable.app/ as the primary URL, with GitHub Pages noted as a mirror.

### Security

- **API Key Scrubbed**: Odds API key (2564d956...) was present in git history. Removed via `git filter-branch`, force-pushed, and history was garbage-collected. Verify the key is rotated at the-odds-api.com.

- **Repository Made Public**: Repo was private until June 2026, required for GitHub Pages free tier. Now public.

---

## Pre-Release

### Initial Commit (Lovable-Generated)

- Vite + React scaffold
- Schedule data for 130 Power 4 teams (2026 season)
- Per-game win % input with spread calculation
- Win distribution chart (binomial convolution)
- Conference game detection and filtering
- Team/conference picker
- Image export (`html2canvas`)
- shadcn/ui component library
- Tailwind CSS styling

---

## Roadmap

### Near Term

- [ ] Prefill win % based on team preseason expectations or historical performance
- [ ] Inline help tooltips explaining spread math and home-field advantage
- [ ] Mobile UX refinement (test on iPhone/Android, optimize input layout for small screens)

### Medium Term

- [ ] Analytics: Track which teams users project on, peak usage times, most popular records
- [ ] Team season records: Display preseason O/U lines from major books for comparison
- [ ] Shareable charts: Generate win distribution chart as PNG for forum posts

### Longer Term

- [ ] Leaderboard: Track predictions across users, show accuracy over the season as actual results come in
- [ ] Lineup builder: Select multiple teams and see their combined bowl odds
- [ ] Historical calibration: Upload prior season picks to see how well your model predicted actual outcomes

---

## Known Issues

- ESLint warnings in shadcn/ui components (not in our code; low priority)
- Chart bundle size is large (~578kb gzipped); could split with dynamic import
- No automated tests for the shareable URL feature; manual testing covers the main flows
