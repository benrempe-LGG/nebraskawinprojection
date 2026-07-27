# Validation Record

## 2026-07-20 — Entry dashboard and release-candidate QC

Branch: `feature/accounts-scorecards-foundation`  
PR: [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2)  
Feature head before documentation reconciliation: `aeb8ad9e1276af2ad6c36981ac0a75b74c84b9f3`

### Automated validation

GitHub Actions CI run 132 completed successfully for `aeb8ad9`.

- `npm install` — passed in CI
- `npm test` — passed
- 22 tests — reported passing in the Lovable current-head validation
- `npm run build` — passed in CI and Lovable validation
- preview artifact upload — passed

Automated coverage includes canonical cross-team predictions, schedule integrity, standings, Notre Dame/playoff selection, playoff gating on four championship winners, and versioned cloud-entry parsing/restoration.

### Manual Lovable preview QC

Validated against the current feature head:

- All public routes loaded and the 404 route rendered.
- Signed-out Groups and Scorecards redirected to Account.
- Persistent desktop navigation rendered cleanly.
- At a 390 by 844 viewport, the navigation was 73 pixels high with the brand on row one and four navigation links on row two.
- `/review#fifty` scrolled to the 50% section after the React page rendered.
- Predictor and Analytics exposed main landmarks; Account exposed a level-one heading.
- The My Entry dashboard and account navigation were present.
- Lovable reported the workspace at `aeb8ad9`, all 22 tests passing, and the production build succeeding without modifying files or settings.

### Production evidence

- Google OAuth previously passed after registering `https://chcsxbqdycmftlivpksq.supabase.co/auth/v1/callback`.
- The production My Entry experience was manually reported as working and visually strong.
- The final July 20 review-anchor, mobile-navigation, and accessibility corrections have not yet been published to production.

### Not validated

- exact Lovable migration ledger and duplicate migration handling
- cross-device version 2 draft, submitted, and locked restore
- two-account private-group create, invite, join, and leaderboard flow
- Apple and email-link authentication
- CFBD score ingestion, secret rejection, team mapping, and weekly scoring
- deadline scheduler and automatic lock execution
- signed-in production regression after the final publish
- `npm run lint`
- a dedicated TypeScript-only command, which is not defined
- browser end-to-end automation, which is not configured as a script
- post-merge GitHub Pages and Lovable verification

A green build is not evidence that external OAuth, migrations, Edge Functions, scheduled jobs, or cross-device behavior are configured.

## 2026-07-21 — Authorization remediation

Source changes prepared on PR #2:

- removed the authenticated-client invocation of `sync_2026_catalog`
- added a forward-only migration that requires a service-role JWT and revokes catalog RPC execution from public, anon, and authenticated roles
- changed `sync-cfbd-scores` to return 500 when `SYNC_SECRET` is unset or blank and 401 when the supplied secret does not match

Automated tests and build must pass on the resulting commit. Live authorization remains unvalidated until Lovable applies the migration, deploys the Edge Function, and exercises authenticated-user, missing-secret, wrong-secret, and valid-secret paths.


## 2026-07-21 — Cloud-save and submission hardening

Branch head: `50de7647f6dde9893cee066835be34ec50912854`  
GitHub Actions: [CI run 156](https://github.com/benrempe-LGG/nebraskawinprojection/actions/runs/29858951662) — passed.

### Automated validation

- lint — passed
- TypeScript typecheck — passed
- unit tests — passed, including serialization, stale-write skipping, failure retry, and in-flight reversion coverage
- migration-history validation — passed and now rejects a latest `submit_entry` definition that uses unsupported `jsonb_object_length(jsonb)`
- production build — passed

### Production smoke test

- Lovable production publish completed and reported `Up to date`.
- Signed-in QC member restored a submitted version 2 entry with 476 of 476 games and four Championship Week picks.
- Editing one prediction displayed `Saving changes…`, then `Submitted · Saved`.
- The QC value was reverted to its original value, the page was fully reloaded, and the original value restored from cloud storage.
- No `Save failed` state appeared.
- The QC member's final prediction value remained unchanged after the test.

Operational safeguards and recovery steps are documented in [Beta Operations and Entry Recovery](BETA_OPERATIONS.md).

### Remaining boundary

The browser queue ensures ordered writes from one active page. Server-side optimistic concurrency or immutable ballot revisions are still recommended before supporting simultaneous editing from multiple devices.

## 2026-07-27 — Physical cross-device entry validation

The product owner exercised the live private beta on a Surface laptop, iPhone, and iPad.

- The same draft entry restored on the Surface and iPhone.
- A saved Surface change appeared on the iPhone after refresh.
- A saved iPhone change appeared on the Surface after refresh.
- The same bidirectional checks passed after submission while the entry remained editable.
- Controlled overlapping edits from a common starting version passed without an observed silent overwrite.
- A separate control account on the iPad remained unchanged.
- The test account was restored to its intended final state.

This closes the physical-device validation criterion for the private beta based on the product owner's report. It does not add a server-side concurrency guarantee; broader beta monitoring should still record any conflicting-edit incident.

## 2026-07-27 — Dependency audit triage

A fresh production-only dependency audit against the branch lockfile reported 14 high, 15 moderate, 3 low, and 0 critical advisories before remediation.

- React Router redirect advisories were treated as runtime-relevant.
- Recharts' Lodash path was treated as runtime-transitive.
- Vite, Rollup, PostCSS, glob, minimatch, picomatch, and related findings primarily follow build-time Lovable MCP or Tailwind paths.
- Blind force upgrades were rejected.

The remediation pass updated compatible direct dependencies, pinned a patched Lodash through npm overrides, and validated post-auth navigation as an internal application path.

### Remediation result

- `react-router-dom` resolved from 6.30.1 to 6.30.4.
- `@remix-run/router` resolved from 1.23.0 to 1.23.3.
- PostCSS resolved from 8.5.6 to 8.5.23.
- Recharts remains on 2.15.4 while its Lodash dependency resolves to the patched 4.18.1 through npm overrides.
- The production-only audit fell from 14 high, 15 moderate, and 3 low findings to 7 high, 7 moderate, and 0 low findings.
- Remaining high findings follow Vite, Rollup, glob, minimatch, picomatch, and brace-expansion build-tooling paths.
- Remaining moderate runtime findings include React Router advisories that require a major upgrade for complete package-level removal; current post-auth navigation is now restricted to same-origin internal paths.

### Automated validation

- lint passed with 9 existing warnings and 0 errors
- TypeScript typecheck passed
- 48 unit tests passed across 11 files, including 7 internal-path cases
- migration validation passed for 11 migrations
- production build passed

## 2026-07-27 — CFBD production-readiness inventory

A read-only Lovable production inspection was completed before any authorized historical fixture write.

- `public.seasons` contains only the active 2026 season with an August 29, 2026 UTC deadline.
- The 2026 catalog contains 476 scheduled games across weeks 1–12.
- No game has a CFBD game ID, final status, or in-progress status.
- Production contains 3 draft ballots, 2 submitted ballots, and 0 locked ballots.
- `weekly_scorecards` returns 0 rows.
- No temporary non-2026 season or catalog remains.
- No writes, function invocations, migrations, deployments, or configuration changes were made.

The authorized 2025 historical fixture test was not executed because the schema restricts season years to 2026–2100 and the deployed sync function uses one season parameter for both the CFBD source year and target catalog. Proceeding would require a production schema or ingestion-contract change solely for testing. A true CFBD import and scorecard validation remains deferred until a 2026 final exists or a separately reviewed testability design is approved.
