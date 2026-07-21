# Known Issues and Technical Debt

Updated: 2026-07-20

## P0 before merging PR #2

### Lovable migration history needs reconciliation

Risk: the repository contains manual and Lovable-generated copies of the versioned Championship Week payload migration. Git contents do not prove which migration identifiers production recorded.

Next action: inspect Lovable's migration ledger and database RPC definitions. Do not delete an applied migration merely to make the repository look cleaner.

### Final preview corrections are not published

Risk: production can lag the branch even when CI and Lovable preview pass.

Next action: publish the current branch through Lovable, then repeat signed-out desktop and phone smoke tests and signed-in entry checks.

### Score-sync authentication fails open when the secret is absent

Risk: `sync-cfbd-scores` accepts an unauthenticated trigger if `SYNC_SECRET` is not configured while using service-role access internally.

Next action: make the secret mandatory or place the function behind a verified authenticated scheduler, then test rejection and success paths.

### Two-account and cross-device testing is incomplete

Risk: create/join links, RLS visibility, leaderboard aggregation, OAuth return, and version 2 entry restoration may work for one account but fail across identities or browsers.

Next action: run a documented owner/member test with two dedicated accounts and restore a submitted and locked entry in a second browser.

### Entry deadline and locking need live testing

Risk: submit, reopen, automatic locking, and locked scorecards depend on deployed RPCs, catalog completeness, deadline configuration, and scheduled invocation.

Next action: validate with a temporary controlled deadline, confirm both prediction layers in `locked_payload`, then restore the official deadline.

## P1

- CFBD provider mapping and real final-score ingestion require live validation.
- Apple and email-link authentication have not been recorded as passing.
- Championship participants use simplified standings tiebreakers.
- The G6 playoff team is an unnamed reserved slot.
- Week-by-week full-slate picking is not implemented.
- Vegas season win totals remain manual; the removed Odds API returned the wrong market.
- CI does not run lint, a dedicated TypeScript check, or browser end-to-end tests.
- No shared QA credentials or administrator role exist; formal testing needs two dedicated standard-user accounts.

## P2

- Commissioner controls do not cover member removal, ownership transfer, leaving, deletion, or renaming.
- No error monitoring or product analytics is configured.
- Bundle-size optimization has not been prioritized.
- OAuth and deployment configuration are partly external to Git and need an operations checklist.
- Both `package-lock.json` and `bun.lock` are tracked while CI uses npm; the canonical package manager should eventually be documented or consolidated without disrupting Lovable.
