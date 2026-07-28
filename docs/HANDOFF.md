# Engineering Handoff

Updated: 2026-07-28

## Exact stopping point

Draft PR [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2) is open and mergeable on `feature/accounts-scorecards-foundation`. The published Confidence Score release baseline is `212830298bb4da184976f589fb324622fb870a23`; subsequent branch work records the release and hardens the dependency toolchain without changing production behavior.

Lovable production is published and reports `Up to date`. Physical cross-device validation has now passed on a Surface, iPhone, and iPad. The product remains in a small friends-and-family beta while live scoring and remaining integration boundaries are validated.

Confidence Scoring Unit 1 is implemented locally on the feature branch: the
framework-independent formula and game-weighted aggregation boundary have 21
focused tests and pass the full local CI gate. No scoring migration, UI, or
production change is included in Unit 1.

At source validation, Confidence Scoring Unit 2 consisted of a forward-only migration,
synchronized Supabase result types, a rollback-only SQL fixture, and CI
contract guards. Full local CI passes, and the migration plus fixture passed in
an ephemeral in-memory PostgreSQL runtime using a minimal Supabase-compatible
schema. It was not yet applied during that source-validation stage.

At source validation, Confidence Scoring Unit 3 made Scorecards and private
groups render game-weighted Confidence Score, correct-pick and game-count
context, one-decimal values, benchmark guidance, responsive layouts, and
unscored states. Three focused page tests and the full 72-test CI suite passed.
It was not yet published during that source-validation stage.

Confidence Scoring Units 2 and 3 are now published in production. Lovable
applied and recorded the confidence schema and ACL cleanup migrations, then
published the matching UI and reported `Up to date`. Signed-in Scorecards and
Groups loaded without browser errors. Ballots remained 3 draft, 2 submitted,
and 0 locked; predictions remained 952; scorecards remained empty because
there are no final games. Real numeric scoring validation remains Unit 4.

A disposable checkout was created outside the Codex workspace to implement and
validate Unit 1. The feature branch on GitHub remains the durable repository
state; do not initialize the surrounding Codex workspace as this repository.

## Current product state

- Google and email-link authentication work in production. Apple authentication is unvalidated and should remain unadvertised.
- Every account starts with zero picks and has one official 2026 entry across all private groups.
- Account switching clears account-scoped browser data before restoring the next user's cloud entry.
- Regular-season picks synchronize across both teams' schedules.
- Championship Week derives four P4 title games and gates the playoff field until all winners are chosen.
- Private-group creation, invitation, owner/member isolation, display names, and member-only invite visibility were tested with two dedicated accounts.
- A complete 476-game, four-champion QC entry submitted successfully through the production `submit_entry` RPC.
- The My Entry dashboard restores cloud data and reports submitted state correctly.
- Automatic cloud saves are serialized per page and expose loading, waiting, saving, saved, and failed states.
- A production change/save/revert/reload smoke test passed without changing the QC member's final picks.
- Draft and submitted entries passed bidirectional physical-device restoration and controlled overlapping-edit checks without an observed silent overwrite.
- A separate iPad control account remained unchanged, and the test account was restored to its intended final state.
- A read-only CFBD readiness inventory confirmed that production has only the 2026 season, 476 scheduled games, no CFBD IDs or final results, and no scorecard rows.
- PR #2 remains intentionally draft.
- Vite is upgraded to 7.3.6 and compatible transitive tooling is refreshed. The production-only dependency audit is 0 high, 5 moderate, 1 low, and 0 critical.

## Security and database state

- `sync_2026_catalog` is restricted to service-role JWTs in source and production.
- `sync-cfbd-scores` fails closed. Missing and incorrect secret headers return 401; `SYNC_SECRET` is configured.
- The migration ledger is reconciled and guarded by `scripts/validate-migrations.mjs`.
- Deadline checks exist in entry RPCs and at the ballot write boundary.
- Independent scheduled locking covers draft and submitted entries.
- Submission completeness and all four P4 championship winners are validated server-side.
- The production PostgreSQL-17 incompatibility in `submit_entry` was fixed with a tracked migration using `jsonb_object_keys`; CI prevents regression.
- Temporary-season tests validated deadline and locking logic without changing the real 2026 deadline.
- Locked payload immutability remains a non-negotiable recovery rule.

## Repository and deployment state

Repository: `benrempe-LGG/nebraskawinprojection`  
Branch: `feature/accounts-scorecards-foundation`  
PR: https://github.com/benrempe-LGG/nebraskawinprojection/pull/2  
Lovable project: https://lovable.dev/projects/aa959e7e-80e8-43d4-b07c-fd05e6b0a950  
Production: https://nebraskawinprojection.lovable.app/

The GitHub remote is available through the connector. The surrounding Codex workspace is not a checkout and must not be initialized as this repository.

## Validation evidence

- GitHub Actions run 157 passed lint, typecheck, unit tests, migration validation, and production build.
- Lovable production reported `Up to date` after publication.
- Google OAuth and email-link authentication were exercised.
- Two-account group membership and identity isolation were exercised.
- Fresh-account zero-state was exercised.
- Complete production submission was exercised through the real RPC.
- Ordered cloud saving was exercised with a production change, visible save state, reversion, and reload.

See `docs/VALIDATION.md` for detailed evidence and `docs/BETA_OPERATIONS.md` for safe production procedures.

## Remaining unvalidated or incomplete state

- Server-side optimistic concurrency or immutable revisions for simultaneous-device edits
- Apple authentication configuration and policy
- A real successful CFBD score import, provider mapping, and weekly scorecard population
- Automatic locking at the real 2026 deadline
- Post-merge GitHub Pages and Lovable verification
- Browser end-to-end automation as a repeatable CI script
- Remaining dependency advisories that require separate React Router work or an upstream Lovable MCP fix
- Week-by-week full-slate picking
- Product analytics and fan-base prediction insights
- Multiple named entries per account

## Decisions still in force

- One official 2026 entry per account during beta
- Submitted entries remain editable until the deadline
- Locked payloads are immutable and scorecards use the locked snapshot
- Private groups are invitation-only
- PR #2 stays draft until beta exit criteria are met
- Google and email are the supported beta login paths

## Recommended next tasks

1. Run one controlled CFBD import after the first 2026 final and verify Confidence Score by hand without exposing the endpoint.
2. Run physical phone QC for the published Scorecards and populated Groups layouts when scored data exists.
3. Let 3 to 10 friends complete the real sign-in, entry, submission, and private-group journey; log every issue with device and browser.
4. Assess React Router 7 as a separate application migration and monitor Lovable MCP for an upstream advisory fix.
5. Validate scheduled locking again near release using a temporary season; never move the real 2026 deadline for testing.

## Restart instructions

```sh
git clone https://github.com/benrempe-LGG/nebraskawinprojection.git
cd nebraskawinprojection
git switch feature/accounts-scorecards-foundation
npm install
npm run ci
npm run dev
```

Then read, in order:

1. `README.md`
2. `docs/HANDOFF.md`
3. `docs/ROADMAP.md`
4. `docs/KNOWN_ISSUES.md`
5. `docs/BETA_OPERATIONS.md`
6. `docs/ARCHITECTURE.md`
7. `docs/DECISIONS.md`
8. `docs/VALIDATION.md`
9. PR #2

Before any production database write, identify one exact test account and season, capture before/after evidence, and preserve all locked payloads.
