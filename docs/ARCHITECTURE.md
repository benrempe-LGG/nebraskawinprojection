# Architecture

Updated: 2026-07-20

## System boundary

The product is a Vite, React, and TypeScript single-page application deployed through Lovable and GitHub Pages. Lovable Cloud provides the Supabase-compatible authentication and PostgreSQL backend used by the feature branch. GitHub is the source repository, pull-request surface, and CI system.

## Client and navigation

`SiteNav.tsx` provides persistent routes to the predictor, My Entry, groups, and authentication. `MyEntry.tsx` is the entry dashboard. `Index.tsx` drives team schedule picking, and `PickReview.tsx` provides remaining-game and 50% review sections.

`predictionStore.ts` assigns a canonical season/team-pair key so one probability updates both team schedules. LocalStorage remains the immediate cache and supports unsigned use.

Derived modules remain intentionally one-way:

1. Canonical regular-season picks
2. Conference and overall standings
3. P4 Championship Week participants and winners
4. Championship-adjusted playoff résumés
5. Final playoff field

The playoff page remains gated until all four P4 championship winners are selected.

## Identity and roles

`AuthContext.tsx` wraps Supabase session state. `Account.tsx` exposes Google, Apple, and email-link entry points plus favorite-team selection. Group invitation destinations are temporarily stored in sessionStorage so OAuth return can continue the invitation.

There is no product administrator role. Authenticated users have one official 2026 entry. Private groups add owner and member relationships without granting application-wide administration.

## Cloud entry lifecycle

`SeasonBallot.tsx` and `ChampionshipWeek.tsx` bridge local state and Supabase RPCs. The modeled lifecycle is:

`draft -> submitted -> locked`

Submitted entries may continue saving until the configured deadline. Locked entries preserve an immutable payload.

`cloudEntry.ts` defines payload version 2:

```text
{
  version: 2,
  predictions: canonical regular-season prediction map,
  championshipPicks: P4 conference winner map
}
```

Legacy flat payloads are read as version 1 and normalized to version 2. Restored Championship Week selections are filtered against the participants derived from the restored regular-season predictions.

## Database and migrations

Migrations define profiles, seasons, teams, games, ballots, predictions, results, private groups, membership, scorecards, RPCs, entry deadlines, favorite-team preference, and versioned entry payloads. RLS restricts users to their mutable data. A security-definer leaderboard RPC exposes aggregate scorecard results only to group members.

The repository currently contains both `202607200001_versioned_championship_payload.sql` and a Lovable-generated timestamped copy, `20260720175508_a3382964-14bb-43af-aa78-011fbace957f.sql`. Do not delete or reapply either until the Lovable migration ledger is reconciled; applied migration history is an operational source of truth.

## Scores

`supabase/functions/sync-cfbd-scores/index.ts` fetches CFBD games, invokes deadline locking, matches catalog teams and games, and upserts final results. Provider and service-role credentials remain server-side.

Current security constraint: the function only rejects an invalid request when `SYNC_SECRET` exists. If the variable is absent, the endpoint accepts unauthenticated triggers. It must fail closed before scheduling or public exposure.

Weekly scorecards compare a locked entry's normalized predictions with final game results.

## Deployment

- Lovable: primary hosted application and database configuration surface
- GitHub Pages: static mirror deployed from `main`
- GitHub Actions: Node 22, dependency install, tests, build, and preview artifact
- Google OAuth callback: `https://chcsxbqdycmftlivpksq.supabase.co/auth/v1/callback`

Preview and production are separate states. The July 20 branch head is validated in Lovable preview, while its final anchor, mobile-nav, and accessibility corrections still require a Lovable production update.

## Constraints

- The playoff model is an explainable heuristic, not an official ranking.
- The top two conference rows determine title-game participants; official tiebreaker trees are not implemented.
- G6 selection is a reserved slot, not a ranked G6 schedule.
- The canonical team-pair key needs expansion for same-season rematches outside the generated championship layer.
- CI does not replace live OAuth, migration-ledger, Edge Function, scheduler, mobile, or cross-device testing.
