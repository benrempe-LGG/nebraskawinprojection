# The P4 Oddsmaker — 2026 Season Predictor

A browser-based college football season prediction game. Users make one canonical pick per matchup, review a full-season entry, project conference standings and championship games, and generate a 12-team playoff outlook.

## Status

**Integration beta on draft PR [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2).** The season foundation is on `main`; accounts, cloud entries, scorecards, private groups, favorite teams, and Championship Week are on `feature/accounts-scorecards-foundation`.

Production: https://nebraskawinprojection.lovable.app/  
GitHub Pages mirror: https://benrempe-lgg.github.io/nebraskawinprojection/

Do not equate code on the feature branch with an applied Lovable database migration or production deployment. See [Handoff](docs/HANDOFF.md).

## Current feature-branch capabilities

- Canonical matchup storage synchronizes a pick across both team schedules
- Team schedule and Next Team navigation
- Missing-pick and 50% review
- Projected overall and conference records
- P4 Championship Week generated from conference standings
- Playoff field withheld until all four P4 title games are picked
- Notre Dame tracking, P4 weighting, and a reserved G6 slot
- Google, Apple, and email-link authentication surfaces
- Supabase-backed profiles, entries, locking, games, results, and weekly scorecard schema
- Favorite-team schedule default
- Private groups with invite codes, sign-in return, and aggregate leaderboards
- CFBD score-sync Edge Function foundation
- Team projection links, forum text, and image export

## Persistence

Canonical predictions remain in browser `localStorage` for immediate calculator behavior. Signed-in regular-season entries can be mirrored to Supabase through the entry lifecycle. Championship selections currently remain browser-local and are not yet part of the cloud entry payload.

Supabase schema changes live in `supabase/migrations/`. The target Lovable Cloud/Supabase project must apply them in order. OAuth provider secrets belong in provider/Lovable configuration and must never be committed.

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

CI currently runs `npm install`, `npm test`, and `npm run build`. Lint and browser end-to-end tests are not CI gates.

## Repository map

- `src/pages/` — predictor, review, standings, championships, playoff, account, scorecards, and groups
- `src/components/SeasonBallot.tsx` — local/cloud entry lifecycle
- `src/contexts/AuthContext.tsx` — Supabase session state
- `src/lib/predictionStore.ts` — canonical matchup persistence
- `src/lib/standings.ts` — conference and overall records
- `src/lib/championships.ts` — P4 title-game participants and picks
- `src/lib/playoff.ts` — committee-proxy playoff model
- `supabase/migrations/` — database schema, RLS, RPCs, deadline, and profile preference
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
