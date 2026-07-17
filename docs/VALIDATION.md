# Validation Record

## 2026-07-17 — Account integration branch

Branch: `feature/accounts-scorecards-foundation`  
PR: [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2)

Feature-head GitHub Actions run 106 completed successfully at `94d60436148cfb80ef6c8bdd91694467f1d290a0`. Documentation-head run 113 also completed successfully at `c0f8743d75883195be6ab399ac81aad630d9a552`.

CI results:

- `npm install` — passed
- `npm test` — passed
- `npm run build` — passed
- preview artifact upload — passed

Automated coverage includes canonical cross-team predictions, schedule integrity, standings, Notre Dame/playoff selection, and the requirement that the playoff remains incomplete until all four P4 championship games are picked.

Manual evidence recorded during the session:

- Lovable production/live test was reported working before the later feature additions.
- Google OAuth initially failed because Google lacked the exact Supabase callback.
- Google OAuth passed after registering `https://chcsxbqdycmftlivpksq.supabase.co/auth/v1/callback`.
- Championship and private-group navigation changes built successfully, but were not yet recorded as live multi-account tests.

Not validated:

- exact set of applied Lovable migrations
- cross-device draft restore and locked-entry restore
- Apple and email-link authentication
- two-account private-group create/join/leaderboard flow
- championship cloud persistence
- CFBD score ingestion and weekly scoring with real final games
- deadline scheduler/automatic lock execution
- manual mobile and desktop smoke suite
- `npm run lint`
- a dedicated TypeScript-only command
- browser end-to-end automation
- post-merge GitHub Pages and Lovable deployments

A green build is not evidence that external OAuth, database migrations, Edge Functions, scheduled jobs, or cross-device behavior are configured.
