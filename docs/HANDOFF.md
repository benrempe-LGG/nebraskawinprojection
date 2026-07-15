# Engineering Handoff

Updated: 2026-07-15

## Exact stopping point

Draft PR [#1](https://github.com/benrempe-LGG/nebraskawinprojection/pull/1) is open and mergeable from `feature/season-prediction-foundation` into `main`. Latest reviewed commit before documentation reconciliation was `3d1aacd2c8a04241d5c9455cac00d60b65e1ffab`; CI run 42 passed tests and production build.

The feature foundation is implemented: canonical shared matchups, migration, season progress, locked local ballots, missing/50% review, conference and overall records, normalized ACC/Big 12 conference schedules, Notre Dame tracking, and weighted playoff projection.

## Working state

- GitHub connector writes directly to the remote feature branch; no local checkout was available in the working directory.
- The PR remains draft and production `main` has not been changed.
- GitHub Pages deploys on pushes to `main`; Lovable is a separate preview/deployment surface.
- Current persistence is localStorage only.

## Read first

1. `README.md`
2. `docs/ROADMAP.md`
3. `docs/KNOWN_ISSUES.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DECISIONS.md`
6. `docs/VALIDATION.md`

## Recommended next tasks

1. Audit all 2026 P4 opponents, dates, locations, and neutral-site flags against official sources; eliminate `TBD` normalized dates.
2. Add final schedule fixtures and migration regression tests.
3. Run lint plus manual desktop/mobile smoke tests, recording results in `docs/VALIDATION.md`.
4. Update PR #1 body, mark ready, merge, and verify both production deployments.
5. Start the Next milestone: a week-by-week full P4 slate that reuses canonical matchup storage.

## Unvalidated state

See `docs/VALIDATION.md`. Do not infer that CI covers mobile layout, sharing/export, real-browser migration, or deployment after merge.

## Restart commands

```sh
git clone https://github.com/benrempe-LGG/nebraskawinprojection.git
cd nebraskawinprojection
git switch feature/season-prediction-foundation
npm ci
npm run dev
```

Then run `npm run lint`, `npm test`, and `npm run build` before making release decisions.
