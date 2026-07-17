# Known Issues and Technical Debt

Updated: 2026-07-17

## P0 before merging PR #2

### Lovable migration state is not fully reconciled

Risk: UI code may call tables, columns, or RPCs that are present in Git but absent from the live Lovable database.

Next action: verify each migration in order and specifically confirm favorite-team, group, scorecard, catalog, and deadline objects.

### Championship picks are browser-local

Risk: a signed-in user's regular-season entry can restore across devices while Championship Week and the resulting playoff can differ.

Next action: version the entry payload and persist championship winners with the user's draft/submitted/locked entry.

### Two-account group testing is incomplete

Risk: create/join links, RLS visibility, leaderboard aggregation, and OAuth return may work for the owner but fail for an invited account.

Next action: run a documented owner/member test using two accounts and separate browsers.

### Entry lifecycle needs live deadline testing

Risk: submit, reopen, and automatic locking depend on deployed RPCs, catalog completeness, deadline configuration, and scheduled invocation.

Next action: validate against a temporary deadline in a non-production test path, then restore the official deadline.

## P1

- CFBD score sync and provider secret configuration require live validation.
- Apple and email-link authentication have not been recorded as passing.
- Championship participants use simplified standings tiebreakers.
- The G6 playoff team is still an unnamed reserved slot.
- Week-by-week full-slate picking is not implemented.
- Vegas season win totals remain manual; the removed Odds API returned the wrong market.
- CI does not run lint, TypeScript-only checks, or browser end-to-end tests.

## P2

- Commissioner controls do not yet cover removing members, transferring ownership, leaving/deleting groups, or renaming groups.
- No error monitoring or product analytics is configured.
- Bundle-size optimization has not been prioritized.
- OAuth and deployment configuration are partly external to Git and require an operations checklist.
