# Product Roadmap

Updated: 2026-07-15

## Now — Production beta readiness

Goal: make the current season predictor safe to merge and label as a public beta.

- Complete an official-source audit of every 2026 P4 opponent, date, location, and neutral-site designation.
- Remove all temporary `TBD` normalized schedule dates.
- Verify saved prediction migration after the final schedule dataset is installed.
- Run manual desktop and mobile QA for picking, shared games, review, standings, playoff, locking, and sharing.
- Reconcile PR #1 description with the implemented model and documentation.
- Merge the draft PR and verify both GitHub Pages and Lovable production deployments.

Exit criteria: CI is green, no known schedule mismatch remains, existing local predictions migrate, primary flows pass manual QA, and production deployment is verified.

## Next — Full-slate picking

Goal: let users predict chronologically instead of only by team.

- Add a week-by-week route covering the complete tracked P4 slate.
- Provide week, conference, picked/unpicked, and 50% filters.
- Reuse canonical matchup storage so week and team pages always stay synchronized.
- Show weekly progress and direct navigation to the next unfinished game.
- Preserve team schedule, standings, review, and playoff behavior.

Exit criteria: every canonical matchup appears exactly once in the weekly view and edits are immediately reflected everywhere else.

## Later — Accounts and simulation depth

- Authentication, cloud drafts, cross-device persistence, and named locked ballots
- Ballot history, comparison, public links, and prediction scoring
- Conference tiebreakers and championship-game simulation
- Résumé model using schedule strength, ranked wins, head-to-head, and bad losses
- Specific Group-of-Six team schedules and selection
- Live results, frozen completed games, accuracy tracking, and community consensus

## Product milestones

1. Public beta
2. Full-slate weekly picker
3. Account-backed ballots
4. Championship and committee simulation
5. Live-season prediction platform
