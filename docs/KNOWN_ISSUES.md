# Known Issues and Technical Debt

Updated: 2026-07-15

## P0 before production beta

### Full schedule/date audit is incomplete

Risk: incorrect opponents, dates, venues, or home/away designations can distort picks, records, and navigation. ACC and Big 12 opponent matrices are normalized and integrity-tested, but some normalized matchups can display `TBD` dates. The broader P4 dataset still needs official-source verification.

Next action: replace the compact source data with an audited canonical dataset and add fixture tests for every conference's expected game counts and reciprocal matchups.

### Manual release QA is unrecorded

Risk: CI does not prove responsive layout, localStorage migration, sharing, image export, or deployment behavior.

Next action: run and record desktop/mobile smoke tests and verify both production hosts after merge.

## P1

### Accounts and cloud persistence are absent

Predictions and locks exist only in localStorage. Clearing storage or changing devices loses access.

### Conference championships are not simulated

Conference leaders are treated as champions. Full tiebreakers, championship participants, and title-game outcomes are not modeled.

### Playoff model is heuristic

Conference coefficients and the ACC/Big 12 cap are transparent assumptions but lack a formal scenario-test suite.

### G6 team is a placeholder

Seed 12 is reserved without tracking or ranking actual Group-of-Six schedules.

### Week-by-week full slate is absent

Users must navigate through team schedules rather than predict each week's complete P4 slate.

## P2

- README and PR description can drift when model coefficients change.
- CI does not currently run `npm run lint`.
- No dedicated TypeScript `typecheck` script exists.
- No end-to-end browser test suite is configured despite Playwright being installed.
- No error monitoring or product analytics is configured.
