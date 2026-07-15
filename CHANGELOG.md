# Changelog

## [Unreleased] — 2026-07-15

### Added

- Canonical season matchup storage with complementary cross-team probabilities
- Legacy per-team and date-based prediction migration
- Full-season progress, missing-game review, 50% review, and immutable local ballot locks
- Projected conference standings and overall records
- Weighted playoff outlook with Notre Dame and a reserved G6 slot
- ACC and Big 12 conference schedule integrity validation
- Pull-request CI for tests, production build, and preview artifact
- Canonical roadmap, architecture, decisions, known issues, validation, and handoff documents

### Changed

- A 50% home game now defaults to the home-field favorite; neutral 50% games remain unresolved
- 2026 ACC and Big 12 league matchups are normalized to official opponent matrices
- Playoff selection favors SEC and Big Ten résumés and normally caps ACC/Big 12 at three combined teams

### Known limitations

- Full P4 opponent/date/location audit and manual release QA remain incomplete
- Accounts, cloud saving, conference championship simulation, specific G6 selection, and week-by-week full-slate picking are not implemented

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
