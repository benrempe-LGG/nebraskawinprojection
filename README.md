# The P4 Oddsmaker — 2026 Season Predictor

A browser-based college football season prediction game. Users make one canonical pick per matchup, review a full-season entry, project conference standings and Championship Week, and generate a 12-team playoff outlook.

## Status

**Live private beta on draft PR [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2).** Production is running the account, entry, private-group, Championship Week, playoff, and cloud-save experience from `feature/accounts-scorecards-foundation`.

Production: https://nebraskawinprojection.lovable.app/  
GitHub Pages mirror: https://benrempe-lgg.github.io/nebraskawinprojection/

Lovable production and the feature branch were reconciled through the Confidence Score release on July 27, 2026. CI, submission, two-account isolation, private-group membership, signed-in cloud saves, and physical cross-device restoration pass. PR #2 remains draft while a small friends-and-family beta validates real usage, locking, and score ingestion.

## Current capabilities

- Canonical matchup storage synchronizes a pick across both team schedules
- Team schedule, favorite-team default, and Next Team navigation
- Missing-pick and 50% review with direct section links
- Projected overall and conference records
- P4 Championship Week generated from conference standings
- Playoff field withheld until all four P4 title games are picked
- Notre Dame tracking, P4 weighting, and a reserved G6 slot
- Google and email-link authentication validated in production
- One official 2026 entry per account with draft, submitted, and locked states
- Version 2 cloud payloads containing regular-season and Championship Week picks
- Ordered automatic cloud saves with visible loading, saving, saved, and failure states
- My Entry dashboard and persistent site navigation
- Private groups with invitation codes, display names, membership RLS, and Confidence Score leaderboards
- Weekly Confidence Score schema and read-only scorecard UI
- Public, read-only 2026 FPI-based benchmark with team schedules and transparent model assumptions
- CFBD score-sync Edge Function foundation
- Team projection links, forum text, and image export

Apple authentication is not validated and should not be advertised during the beta.

## Persistence and identity

Unsigned predictions use browser `localStorage`. Signed-in entries use a version 2 cloud payload containing the canonical prediction map and Championship Week winners. Account changes clear the browser cache before the newly signed-in user's cloud entry is restored, preventing picks from leaking between identities.

Automatic saves from one active page are serialized so the newest queued payload is written last. Simultaneous editing from multiple devices does not yet have server-side optimistic concurrency; users should wait for the visible saved state before switching devices.

There is no administrator product role or admin console. Authenticated users are standard users. Private-group ownership and membership are scoped relationships. Each account currently has one official 2026 entry, shared across every group that user joins.

## Configuration

Lovable provides the Supabase-compatible database and browser client. OAuth provider credentials remain in Google, Apple, and Lovable configuration and must never be committed.

The score-sync Edge Function expects server-side values:

- `CFBD_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SYNC_SECRET`

The deployed function fails closed when `SYNC_SECRET` is absent or incorrect. A real successful CFBD import remains intentionally unrun.

## Development

Requires Node.js 22.

```sh
npm install
npm run dev
npm run lint
npm run typecheck
npm run test:ci
npm run migrations:validate
npm run build
npm run preview
```

`npm run ci` runs lint, typecheck, unit tests, migration validation, and the production build. GitHub Actions runs the same gates and uploads the preview artifact.

## Repository map

- `src/App.tsx` and `src/components/SiteNav.tsx` — routes and persistent navigation
- `src/pages/MyEntry.tsx` — official-entry dashboard
- `src/components/SeasonBallot.tsx` — local/cloud entry lifecycle and save-state UI
- `src/contexts/AuthContext.tsx` — Supabase session and account isolation
- `src/lib/predictionStore.ts` — canonical matchup persistence
- `src/lib/cloudEntry.ts` — versioned cloud payload parsing and restoration
- `src/lib/cloudSaveQueue.ts` — latest-write serialization for automatic saves
- `src/lib/standings.ts` — conference and overall records
- `src/lib/championships.ts` — P4 title-game participants and picks
- `src/lib/playoff.ts` — committee-proxy playoff model
- `supabase/migrations/` — schema, RLS, RPCs, entry lifecycle, deadlines, and hardening
- `supabase/functions/sync-cfbd-scores/` — actual-result ingestion foundation
- `scripts/validate-migrations.mjs` — migration-ledger and RPC compatibility guard
- `.github/workflows/ci.yml` — full validation pipeline
- `docs/BETA_OPERATIONS.md` — deployment, smoke-test, and entry-recovery runbook
- `docs/CONFIDENCE_SCORING.md` — approved entry-ranking and scorecard specification

## Restart order

1. [Current handoff](docs/HANDOFF.md)
2. [Roadmap](docs/ROADMAP.md)
3. [Known issues](docs/KNOWN_ISSUES.md)
4. [Beta operations](docs/BETA_OPERATIONS.md)
5. [Architecture](docs/ARCHITECTURE.md)
6. [Decision log](docs/DECISIONS.md)
7. [Validation](docs/VALIDATION.md)
8. [Changelog](CHANGELOG.md)

For entertainment and analysis only. Not affiliated with any university, conference, sportsbook, Google, CFBD, Supabase, or Lovable.
