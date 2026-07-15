# P4 Oddsmaker — Architecture and Design

Updated: 2026-07-15

## Runtime and routes

The application is a Vite 5, React 18, and TypeScript single-page application styled with Tailwind and shadcn/ui. React Router exposes:

- `/` — team calculator
- `/analytics` — expected-win analytics
- `/review` — missing and 50% game review
- `/standings` — conference and overall projected records
- `/playoff` — 12-team committee-proxy outlook

There is no application backend.

## Core data flow

```text
2026 schedule data
  -> canonical matchup ID (season + ordered team pair)
  -> browser localStorage prediction
  -> team calculator / review / standings / playoff / locked ballot
```

`src/lib/oddsmaker.ts` contains compact team schedules, spread math, and ACC/Big 12 conference-opponent normalization. `predictionStore.ts` stores one percentage per matchup and returns the complementary value from the opponent's perspective. IDs intentionally exclude dates because source schedules previously disagreed and produced duplicate games.

`ballot.ts` enumerates unique season matchups, calculates completion, and stores immutable snapshots. `standings.ts` derives conference and overall records. `playoff.ts` builds records, tracks Notre Dame, applies a transparent conference-strength proxy, selects projected champions and at-large teams, and reserves seed 12 for an unspecified G6 champion.

## Calculator and sharing

Per-game probabilities feed a logit-based implied spread with 2.75 points of home-field advantage and a dynamic-programming win distribution. Team projections can be shared through query parameters, copied as forum text, or exported as images.

## Persistence and migration

All mutable state is local to the browser. Predictions and locked ballots use versioned localStorage keys. Migration code collapses legacy per-team and date-based records into canonical matchups. There is no user identity, remote database, telemetry, or server API.

## Schedule data

Schedules are hardcoded and expanded into `ALL_TEAMS` and `CONFERENCES`. Conference detection cross-references the opponent's conference. Official 2026 ACC and Big 12 opponent matrices are normalized at runtime and tested for expected counts, uniqueness, and reciprocal listings.

The full P4 opponent/date/location audit remains a production-beta blocker. See `KNOWN_ISSUES.md`.

## Deployment

- `.github/workflows/ci.yml` runs `npm ci`, `npm test`, and `npm run build` for pull requests and `main`.
- `.github/workflows/deploy.yml` deploys GitHub Pages from `main` using `DEPLOY_BASE_PATH=/nebraskawinprojection/`.
- Lovable is a separate root-hosted preview/deployment surface.

## Security history

An Odds API key was committed and removed from source and Git history in June 2026. The old integration was deleted because it returned game totals rather than season win totals. Confirm the key was rotated at the provider; no runtime API key is currently required.

## Constraints

- Schedule accuracy is source-data dependent.
- Conference tiebreakers and championship games are simplified.
- The playoff output is an explainable heuristic, not an official ranking.
- G6 schedules are absent.
- Local-only storage prevents cross-device recovery.
- A same-season rematch would require expanding the current canonical game ID.
