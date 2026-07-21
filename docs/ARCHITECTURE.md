# Architecture

Updated: 2026-07-21

## Product flow

The application is a Vite/React single-page app for a 2026 Power Four season prediction game.

1. A user selects a team and assigns win probabilities to regular-season games.
2. `predictionStore.ts` stores each matchup once using a canonical season/team-pair key.
3. Both teams' schedule views read the same prediction and display complementary probabilities.
4. Standings derive overall and conference records from projected winners.
5. Championship Week selects the top two teams in each P4 conference.
6. The user picks four conference champions.
7. The playoff model adjusts title-game participants and produces a 12-team field.
8. Signed-in users submit one official entry and compare it in private groups.
9. Locked entries and final results feed weekly scorecards.

## Frontend structure

- `src/App.tsx` — routes and protected-route composition
- `src/components/SiteNav.tsx` — persistent responsive navigation
- `src/pages/Index.tsx` — team schedule predictor
- `src/pages/MyEntry.tsx` — official-entry dashboard
- `src/components/SeasonBallot.tsx` — progress, cloud hydration, autosave, submission, and status UI
- `src/pages/PickReview.tsx` — remaining and 50% review
- `src/pages/Standings.tsx` — conference standings
- `src/pages/ChampionshipWeek.tsx` — derived title games and winners
- `src/pages/Playoff.tsx` — championship-gated playoff projection
- `src/pages/Groups.tsx` — private groups and invitations
- `src/pages/Scorecards.tsx` — read-only weekly scoring surface
- `src/contexts/AuthContext.tsx` — authentication and account-isolated browser state

## Prediction identity

Regular-season games use a canonical key built from season and alphabetically ordered team names. Date is excluded because schedule sources previously disagreed on dates and created duplicate entries.

This keeps both team schedules synchronized. The constraint is that same-season rematches require a separate identity layer. Generated conference championship games remain outside the regular-season key set.

## Identity and local storage

Lovable Cloud supplies a Supabase-compatible session. Google and email-link authentication work in production. Apple is not a supported beta path.

Unsigned users store picks only in `localStorage`. Signed-in account changes clear prediction, championship, favorite-team, and Vegas browser state before the new account's cloud entry loads. This prevents one account's local cache from appearing in another.

`accountStorage.ts` owns account-scoped resets. `cloud-entry-loaded` and `account-storage-reset` events refresh predictor and entry-dashboard views after hydration.

## Cloud entry lifecycle

The lifecycle is:

`draft -> submitted -> locked`

Submitted entries remain editable until the configured deadline. Locked entries preserve an immutable `locked_payload` for scoring.

`cloudEntry.ts` defines payload version 2:

```text
{
  version: 2,
  predictions: canonical regular-season prediction map,
  championshipPicks: P4 conference winner map
}
```

Legacy flat payloads normalize to version 2. Restored championship selections are filtered against participants derived from restored regular-season picks.

Each account has one 2026 ballot. That same entry is visible in every private group the user joins.

## Automatic save ordering

`cloudSaveQueue.ts` serializes writes from one active browser page:

1. A local change becomes the newest desired payload.
2. Only one RPC write runs at a time.
3. Queued stale payloads that never started are skipped.
4. If a write is active, the newest desired payload runs afterward.
5. The UI reports loading, waiting, saving, saved, or failed.
6. Submission waits for the active save queue to become idle, then submits the complete current payload through `submit_entry`.

This prevents out-of-order completion within one page. It does not prevent two independent devices from overwriting one another; server-side optimistic concurrency or immutable revisions are future work.

## Database and authorization

Tracked migrations define profiles, seasons, teams, games, ballots, normalized predictions, results, groups, membership, scorecards, RPCs, deadlines, and scheduled locking.

Key controls:

- RLS scopes mutable user data.
- `sync_2026_catalog` requires a service-role JWT.
- `sync-cfbd-scores` requires a matching configured secret and uses server-side credentials.
- Entry RPCs and a ballot trigger enforce the deadline.
- Scheduled locking snapshots both draft and submitted entries.
- `submit_entry` derives the required game count server-side and requires four P4 championship winners.
- Locked payloads are immutable.
- `scripts/validate-migrations.mjs` checks canonical migration identities, duplicate schema creation, and the current submission-count implementation.

The production database uses PostgreSQL 17. Submission counts use `jsonb_object_keys`; `jsonb_object_length(jsonb)` is intentionally rejected by CI.

## Groups

Private groups use an eight-character invitation code or shareable link. Membership RLS limits group visibility. Owners can regenerate invitation codes; members cannot see owner-only invite controls. Display names are profile-scoped. There is no application-wide administrator role.

## Scores

`supabase/functions/sync-cfbd-scores/` fetches CFBD games, invokes due-entry locking, matches canonical or reversed game orientation, applies team aliases, and upserts final results idempotently.

Denial paths and fixture matching are verified. A real successful provider import and production weekly scorecard population remain pending.

## Deployment

- Lovable — primary application, database, migrations, authentication, Edge Functions, and production publication
- GitHub Pages — static mirror deployed from `main`
- GitHub Actions — Node 22; lint, typecheck, unit tests, migration validation, production build, preview artifact
- Google OAuth callback — `https://chcsxbqdycmftlivpksq.supabase.co/auth/v1/callback`

Repository commits, Lovable preview, applied migrations, Edge Functions, and production publication are separate states. The beta operations runbook requires explicit reconciliation and smoke testing.

## Constraints

- The playoff model is an explainable heuristic, not an official committee ranking.
- Conference title participants use simplified standings tiebreakers.
- G6 selection is a reserved slot, not a ranked G6 schedule.
- Same-season regular-season rematches need a richer canonical identity.
- Simultaneous-device entry edits lack server-side conflict detection.
- Weekly full-slate picking is not implemented.
- Live CFBD ingestion, real-deadline locking, and Apple authentication remain unvalidated.
