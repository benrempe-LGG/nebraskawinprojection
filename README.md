# The P4 Oddsmaker — 2026 Season Predictor

A browser-based college football season prediction game. Users make one canonical pick per matchup, review a full-season entry, project conference standings and Championship Week, and generate a 12-team playoff outlook.

## Status

**Integration beta on draft PR [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2).** The season foundation is on `main`; accounts, cloud entries, scorecards, private groups, favorite-team defaults, Championship Week, and the My Entry dashboard are on `feature/accounts-scorecards-foundation`.

Production: https://nebraskawinprojection.lovable.app/  
GitHub Pages mirror: https://benrempe-lgg.github.io/nebraskawinprojection/

Production contains the account and entry experience, but the final July 20 review-anchor, compact-mobile-navigation, and accessibility corrections remain unpublished in Lovable. Repository code, applied Lovable migrations, preview state, and production deployment are separate states. See [Handoff](docs/HANDOFF.md).

## Current feature-branch capabilities

- Canonical matchup storage synchronizes a pick across both team schedules
- Team schedule, favorite-team default, and Next Team navigation
- Missing-pick and 50% review with direct section links
- Projected overall and conference records
- P4 Championship Week generated from conference standings
- Playoff field withheld until all four P4 title games are picked
- Notre Dame tracking, P4 weighting, and a reserved G6 slot
- Google, Apple, and email-link authentication surfaces
- One official 2026 entry per account with draft, submitted, and locked states
- Versioned cloud payloads containing regular-season and Championship Week picks
- My Entry dashboard and persistent site navigation
- Private groups with invite codes, sign-in return, and aggregate leaderboards
- Weekly scorecard schema and read-only scorecard UI
- CFBD score-sync Edge Function foundation
- Team projection links, forum text, and image export

## Persistence and identity

Local `localStorage` remains the immediate cache for unsigned use. Signed-in entries use a version 2 cloud payload containing both the canonical prediction map and Championship Week winners. Legacy flat prediction payloads are upgraded by the client. Once the matching Lovable migration is applied, draft, submitted, and locked payloads preserve both layers across sessions and devices.

There is no administrator product role or admin console. Authenticated users are standard users; private-group ownership and membership are scoped group relationships.

## Configuration

Lovable generates the browser-side Supabase client. OAuth provider credentials remain in Google, Apple, and Lovable configuration and must never be committed.

The score-sync Edge Function expects these server-side values:

- `CFBD_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SYNC_SECRET`

The sync endpoint must fail closed if `SYNC_SECRET` is missing before it is scheduled or exposed.

## Development

Requires Node.js 22.

```sh
npm install
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

CI runs `npm install`, `npm test`, and `npm run build`. Lint, a dedicated type-check command, and browser end-to-end tests are not CI gates.

## Repository map

- `src/App.tsx` and `src/components/SiteNav.tsx` — routes and persistent navigation
- `src/pages/MyEntry.tsx` — official-entry dashboard
- `src/components/SeasonBallot.tsx` — local/cloud entry lifecycle
- `src/contexts/AuthContext.tsx` — Supabase session state
- `src/lib/predictionStore.ts` — canonical matchup persistence
- `src/lib/cloudEntry.ts` — versioned cloud payload parsing and restoration
- `src/lib/standings.ts` — conference and overall records
- `src/lib/championships.ts` — P4 title-game participants and picks
- `src/lib/playoff.ts` — committee-proxy playoff model
- `supabase/migrations/` — schema, RLS, RPCs, entry lifecycle, and preferences
- `supabase/functions/sync-cfbd-scores/` — actual-result ingestion foundation
- `.github/workflows/ci.yml` — tests, build, and preview artifact

## Restart order

1. [Current handoff](docs/HANDOFF.md)
2. [Roadmap](docs/ROADMAP.md)
3. [Known issues](docs/KNOWN_ISSUES.md)
4. [Architecture](docs/ARCHITECTURE.md)
5. [Decision log](docs/DECISIONS.md)
6. [Validation](docs/VALIDATION.md)
7. [Changelog](CHANGELOG.md)

For entertainment and analysis only. Not affiliated with any university, conference, sportsbook, Google, CFBD, Supabase, or Lovable.
