# The P4 Oddsmaker — 2026 Season Predictor

A browser-based college football prediction tool for the 2026 Power Four season. Set a win probability for each matchup once, then use the same canonical picks across team schedules, conference standings, ballot review, and the playoff outlook.

## Status

**Public-beta candidate.** Development is on `feature/season-prediction-foundation` in draft PR [#1](https://github.com/benrempe-LGG/nebraskawinprojection/pull/1). CI runs tests and a production build. Before a production release, complete the official-source schedule/date audit and manual mobile/desktop QA described in [Known Issues](docs/KNOWN_ISSUES.md).

Live production currently reflects `main`:

- Lovable: https://nebraskawinprojection.lovable.app/
- GitHub Pages: https://benrempe-lgg.github.io/nebraskawinprojection/

## Current features

- Team-by-team win probability entry for every tracked P4 schedule
- Canonical matchup storage: entering a game from either team updates both schedules
- Implied point spreads and expected-win distributions
- Season-wide progress, missing-pick review, and 50% game review
- Immutable locked ballot snapshots stored in the browser
- Projected conference and overall records
- Weighted 12-team playoff outlook with Notre Dame tracking and a reserved G6 slot
- Copyable links, forum text, and image exports for team projections
- Automated schedule-integrity, prediction-store, ballot, test, and build validation

## Persistence and privacy

Predictions and locked ballots use browser `localStorage`. There is no account system, server database, or cross-device synchronization yet. Clearing browser storage removes local data. No application environment variables are currently required.

## Development

Requires Node.js 20.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

The development server defaults to port 8080. GitHub Pages builds with `DEPLOY_BASE_PATH=/nebraskawinprojection/`; root-hosted previews use `/`.

## Repository map

- `src/pages/` — calculator, analytics, standings, review, playoff, and fallback routes
- `src/components/` — season ballot and UI components
- `src/lib/oddsmaker.ts` — schedule data, conference normalization, and spread math
- `src/lib/predictionStore.ts` — canonical matchup identifiers, persistence, and migration
- `src/lib/ballot.ts` — season progress and locked snapshots
- `src/lib/standings.ts` — projected conference and overall records
- `src/lib/playoff.ts` — transparent committee-proxy model
- `.github/workflows/ci.yml` — pull-request tests and build
- `.github/workflows/deploy.yml` — GitHub Pages deployment from `main`

## Project documents

Read these in order when restarting work:

1. [Current handoff](docs/HANDOFF.md)
2. [Roadmap](docs/ROADMAP.md)
3. [Known issues](docs/KNOWN_ISSUES.md)
4. [Architecture](docs/ARCHITECTURE.md)
5. [Decision log](docs/DECISIONS.md)
6. [Validation record](docs/VALIDATION.md)
7. [Changelog](CHANGELOG.md)

For entertainment and analysis purposes only. Not affiliated with any university, conference, or sportsbook.
