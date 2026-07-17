# Architecture

Updated: 2026-07-17

## System boundary

The product is a Vite/React/TypeScript single-page application deployed through Lovable and GitHub Pages. Lovable Cloud provides the Supabase-compatible authentication and PostgreSQL backend used by the feature branch. GitHub remains the source repository and CI surface.

## Client

`src/pages/Index.tsx` drives team schedule picking. `predictionStore.ts` assigns a canonical season/team-pair key so one probability updates both schedules. LocalStorage remains the immediate client cache and supports unsigned use.

Derived modules are intentionally one-way:

1. Canonical regular-season picks
2. Conference and overall standings
3. P4 Championship Week participants and winners
4. Championship-adjusted playoff résumés
5. Final playoff field

The playoff page remains gated until all four P4 championship winners are selected.

## Identity and cloud entries

`AuthContext.tsx` wraps Supabase session state. `Account.tsx` exposes Google, Apple, and email-link entry points plus favorite-team selection. Group invitation destinations are temporarily stored in sessionStorage so OAuth return can continue the invitation.

`SeasonBallot.tsx` bridges local predictions and Supabase RPCs. The modeled lifecycle is:

`draft -> submitted -> locked`

Submitted entries may reopen before the configured deadline. Locked entries preserve an immutable payload. Database RLS restricts users to their own mutable data.

## Database

Migrations define profiles, seasons, teams, games, ballots, predictions, results, private groups, group membership, scorecards, RPCs, entry deadlines, and favorite-team preference. Migrations must be applied sequentially in Lovable Cloud; repository presence does not prove deployment.

Private groups use generated invite codes. Membership gates group reads. A security-definer leaderboard RPC exposes only aggregate scorecard results to fellow group members.

## Scores

`supabase/functions/sync-cfbd-scores/index.ts` is the score-ingestion foundation. Provider credentials must remain server-side. Weekly scorecards compare a locked entry's normalized predictions with final game results.

## Persistence boundary

Regular-season picks use localStorage for responsive unsigned behavior and can be saved into the signed-in Supabase entry. Favorite team is stored in the profile and cached locally. Championship selections currently use localStorage only; this is the principal persistence gap before integration beta completion.

## Deployment and configuration

- Lovable: primary hosted application and database configuration surface
- GitHub Pages: static mirror deployed from `main`
- GitHub Actions: Node 22, install, tests, build, preview artifact
- Google OAuth callback observed for the Lovable Cloud project: `https://chcsxbqdycmftlivpksq.supabase.co/auth/v1/callback`

Do not document or commit OAuth client secrets, CFBD keys, service-role keys, or private provider credentials.

## Constraints

- The playoff model is an explainable heuristic, not an official ranking.
- The top two conference rows determine title-game participants; official tiebreaker trees are not implemented.
- G6 selection is a reserved slot, not a ranked G6 schedule.
- The canonical team-pair key would need expansion for same-season rematches outside the generated championship layer.
- CI does not replace live Lovable database, OAuth, mobile, or cross-device testing.
