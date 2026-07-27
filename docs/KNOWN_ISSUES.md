# Known Issues and Technical Debt

Updated: 2026-07-27

There are no known release-blocking defects for the small friends-and-family beta. The following items block broader launch or PR #2 merge readiness.

## Confidence Scoring awaits real-final validation

Status: calculation, database, SQL fixture, scorecard, and private-group UI
units are published. Production schema, ACL, signed-in Scorecards empty state,
and Groups benchmark copy passed validation.

Risk: production has no locked ballots or final games, so numeric scorecards,
populated leaderboard order, corrected-result recomputation, and real provider
integration are not yet proven end to end.

Next action: after the first real 2026 final, run one controlled CFBD import and
compare weekly and season Confidence Score with a hand calculation.

## P1 — Before broader launch or merge

### Cross-device conflict protection lacks a server-side guarantee

Status: physical testing on a Surface, iPhone, and iPad passed draft and submitted restoration, bidirectional saves, controlled overlapping edits, control-account isolation, and final restoration. No silent overwrite was observed.

Risk: the implementation still does not enforce optimistic concurrency or retain immutable draft revisions, so the successful test is evidence rather than a server-side guarantee.

Next action: monitor the private beta for conflicting-edit incidents. Add an expected-version check or ballot revision history before broader launch if simultaneous editing becomes a supported behavior or any silent overwrite is reported.

### Real CFBD ingestion is not validated

Status: secret denial paths, fixture matching, reversed orientation, aliases, unmatched games, and idempotent behavior are covered. The deployed endpoint fails closed. A July 27 read-only production inventory confirmed 476 scheduled 2026 games, no CFBD IDs, no final or in-progress games, no scorecard rows, and no retained temporary season.

Risk: a real provider payload or mapping difference could prevent results and weekly scorecards from populating.

Next action: run one controlled successful import after the first 2026 final and verify results plus scorecards. Do not weaken the production season constraint or change the source/target season contract solely to manufacture a historical test.

### Apple authentication is unsupported for beta

Status: Google and email-link authentication work. Apple produced provider/configuration errors and has not been validated with developer credentials.

Risk: exposing the Apple button creates a broken onboarding path.

Next action: keep Apple unadvertised or disabled until a supported configuration is tested; otherwise remove the UI path.

### Real-deadline automatic locking is not exercised

Status: RPC, trigger, scheduler, completeness, and locked-payload behavior passed temporary-season database tests.

Risk: production scheduling or deadline configuration could differ at the real 2026 cutoff.

Next action: repeat the temporary-season operational test near release and verify scheduler visibility. Never change the official 2026 deadline merely for testing.

### Dependency audit findings need triage

Status: a fresh July 27 production-only audit reported 14 high, 15 moderate, 3 low, and 0 critical advisories before remediation. Compatible updates reduced that to 7 high, 7 moderate, 0 low, and 0 critical. Full CI passes.

Risk: the remaining high findings follow Vite, Rollup, glob, minimatch, picomatch, and brace-expansion build-tooling paths. React Router retains moderate advisories that require a major upgrade for complete package-level removal; application post-auth redirects are now constrained to internal same-origin paths.

Next action: assess React Router 7 and the latest Lovable MCP/Vite stack as separately validated upgrades. Do not run a blind force fix.

## P2 — Product and operational debt

- Browser end-to-end tests are not configured as a repeatable CI command.
- Product error monitoring and a user-facing beta feedback path are not implemented.
- Privacy-safe aggregate prediction analytics and own-team fan-cohort insights are not implemented.
- One account supports only one official 2026 entry; multiple named entries require new entry identity, scoring, and group-leaderboard design.
- Commissioner controls do not cover member removal, ownership transfer, leaving, deletion, or renaming.
- Championship participants use simplified standings tiebreakers.
- The G6 playoff team is an unnamed reserved slot.
- Week-by-week full-slate picking is not implemented.
- Vegas season win totals remain manual; the removed Odds API returned the wrong market.
- OAuth and deployment configuration remain partly external to Git.
- Both `package-lock.json` and `bun.lock` are tracked while CI uses npm; consolidation must not disrupt Lovable.

## Resolved July 21

- Production and Lovable preview drift was published and reconciled.
- Migration history was reconciled and is CI-validated.
- Browser catalog mutation was removed and the RPC restricted to service-role JWTs.
- Score synchronization now fails closed and rejects missing or incorrect secrets.
- Entry deadlines are enforced in RPCs and at the ballot write boundary.
- Automatic locking covers draft and submitted ballots.
- Server submission validates catalog completeness and all four P4 champions.
- PostgreSQL-17 submission compatibility was repaired and protected by CI.
- Fresh accounts begin with zero picks; account switching no longer leaks browser state.
- Two-account private-group owner/member behavior was exercised.
- Automatic saves are ordered and expose truthful save status.
