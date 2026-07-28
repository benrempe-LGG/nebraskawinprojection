# Validation Record

## 2026-07-28 - Public FPI benchmark source validation

- Captured 138 published 2026 FPI team ratings from ESPN's July 21, 2026 table.
- Generated one probability for all 476 canonical beta games.
- Verified every tracked P4 team maps to a published rating and only documented
  unranked opponents use the fallback.
- Nebraska's derived expected record is 6.7-5.3, matching the displayed ESPN
  projected record to one decimal under the documented conversion.
- Confirmed the page renders without authentication and contains source,
  assumptions, fallback disclosure, and non-affiliation language.
- Seven focused model/page tests passed. Full local validation passed with 79
  tests across 16 files, TypeScript checks, 13 migration validations, lint
  (nine existing warnings, zero errors), and a Vite production build.
- Local signed-out browser validation confirmed the public route, attribution,
  Nebraska 6.7-5.3 projection, all schedule rows, fallback disclosure, and
  independent-model disclaimer. Production publication evidence remains
  separate.
- Added a public FPI end-of-year scenario with 67 complete P4 records, four
  conference standings, four neutral-site championship projections, 11 named
  playoff selections, and the reserved G6 position.
- Verified FPI-specific tie-breaking ranks Miami above Louisville and Texas
  Tech above BYU when projected conference records are equal.
- Full local validation passed after the season view with 83 tests across 18
  files, TypeScript checks, 13 migration validations, lint (nine existing
  warnings, zero errors), and a Vite production build.

## 2026-07-27 - Confidence Scoring controlled production release

The Unit 2 database contract and Unit 3 UI were released together after local,
disposable-PostgreSQL, and GitHub CI validation.

Database evidence:

- Lovable recorded and applied confidence migration
  `20260727203225_3d3c8878-8710-46ba-8672-77d0b8ebe3a7`.
- Lovable recorded and applied scorecard ACL migration
  `20260727204031_5963c6d0-f886-4d23-980e-cd195dca53f4`.
- `weekly_scorecards` exposes `confidence_games` and `confidence_score` and
  retains `security_invoker=true`.
- `get_group_leaderboard` exposes both confidence fields, retains its fixed
  security-definer search path and membership check, and is not executable by
  anon or public.
- Anonymous and public privileges were removed from `weekly_scorecards`;
  authenticated and service-role access remain.
- Ballot counts remained 3 draft, 2 submitted, and 0 locked.
- Prediction count remained 952, and no ballot or prediction payload changed.
- `weekly_scorecards` remained at 0 rows because production has no locked
  ballots or final games.

Application evidence:

- Lovable production publish completed and reported `Up to date`.
- A signed-in production session loaded `/scorecards` and displayed
  `Not scored yet` without a query error.
- A signed-in production session loaded `/groups` and displayed the Confidence
  Score explanation and 75 benchmark without a query error.
- Production browser logs contained no errors during these checks.
- The source ledger was reconciled to Lovable's actual applied migration
  identities; no duplicate pending migration remains.

Real numeric scoring, populated leaderboard order, and idempotent result refresh
remain deferred until a real 2026 final exists. No synthetic production result
was created.

## 2026-07-27 - Confidence Scoring Unit 3 source validation

Implemented the scorecard and private-group Confidence Score UI without
publishing it.

- Season Confidence Score is weighted by `confidence_games`, not weekly rows.
- Weekly and season values display to one decimal while the RPC retains
  full-precision ranking.
- Scorecards retain correct-pick and accuracy context.
- Group rows show Confidence Score, correct of final picks, and confidence
  games so partial data remains visible.
- The 75 = 50/50 benchmark explanation is visible on both pages.
- Empty scorecards and null confidence use `Not scored yet`, not zero.
- The leaderboard renders rows in RPC order and does not re-sort rounded values.
- Responsive grid classes stack score details below member/game context on
  phones and restore columns at the existing `sm` breakpoint.
- Three focused page tests passed for empty state, precision, game weighting,
  benchmark copy, and RPC order.
- Full CI passed: 9 existing lint warnings and 0 errors, TypeScript typecheck,
  72 tests across 14 files, 12-migration contract validation, and production
  build.

The UI was not connected to production because the Unit 2 migration is not yet
applied there. No production deployment or configuration change occurred.

## 2026-07-27 - Confidence Scoring Unit 2 source validation

Implemented one forward-only migration for weekly scorecards and the private
group leaderboard without applying it to production.

- Weekly scorecards remain security-invoker and score only locked normalized
  predictions.
- Final tied games are excluded from accuracy and confidence calculations.
- Null confidence remains eligible for accuracy when resolvable but is excluded
  from `confidence_games` and Confidence Score.
- Group totals weight weekly scores by eligible games.
- Private leaderboard access retains its membership check, security-definer
  fixed search path, and restricted execution grants.
- Ranking uses unrounded Confidence Score, Correct Picks, then display name.
- Generated Supabase result types were synchronized with the added columns.
- A rollback-only SQL fixture covers eligibility, ties, null confidence,
  weighted totals, ranking, Correct Picks tie-breaking, score corrections, and
  non-member rejection.
- The migration applied and the rollback-only fixture passed in PGlite 0.5.4,
  an ephemeral in-memory PostgreSQL runtime.
- CI passed with 9 existing lint warnings and 0 errors, TypeScript typecheck,
  69 tests, validation of 12 migrations, and the production build.

The PGlite harness used a minimal Supabase-compatible schema, so this is not a
full local Supabase-stack integration test. No production migration, data
write, deployment, or configuration change occurred.

## 2026-07-27 - Confidence Scoring Unit 1

Implemented the pure TypeScript scoring boundary without database, UI, or
production changes.

- All approved worked examples passed, including the neutral 50% benchmark.
- Missing confidence and unresolved/tied outcomes are excluded rather than
  treated as zero or 50%.
- Confidence outside the stored 50-100 range is rejected.
- Weekly aggregation uses the arithmetic mean of eligible games.
- Cumulative aggregation weights by eligible games and preserves unrounded
  values for later ranking.
- The focused suite passed 21 tests.
- The complete local CI gate passed: lint with 9 existing warnings and 0
  errors, TypeScript typecheck, 69 tests across 12 files, validation of 11
  migrations, and the production build.

Unit 1 does not prove database scoring, leaderboard ordering, UI display, or
production behavior. Those remain separate implementation units.

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

## 2026-07-28 — Vite 7 dependency hardening

Vite was upgraded from 5.4.19 to 7.3.6 as a bounded security update. The existing React SWC plugin supports Vite 7, local Node 24 and CI Node 22 satisfy its engine requirement, and no application source or production configuration changed. Compatible transitive tooling was refreshed, including Sucrase 3.35.1, which replaces its vulnerable Glob chain with Tinyglobby.

### Remediation result

- Vite resolves to 7.3.6, Rollup to 4.62.3, and the root esbuild to 0.28.1.
- Sucrase resolves to 3.35.1 and no longer installs the vulnerable Glob 10 chain in the npm dependency tree.
- `package-lock.json` and `bun.lock` were both refreshed.
- The production-only audit fell from 7 high, 7 moderate, 0 low, and 0 critical to 0 high, 5 moderate, 1 low, and 0 critical.
- Remaining moderate findings are React Router and the Lovable MCP/Hono chain. React Router requires a separately validated major application migration; the Lovable MCP chain has no upstream audit fix.
- The remaining low finding is an esbuild development-server path under Lovable MCP.

### Automated validation

- lint passed with 9 existing warnings and 0 errors
- both TypeScript typechecks passed
- 72 tests passed across 14 files
- migration validation passed for 13 migrations
- the Vite 7 production build passed
