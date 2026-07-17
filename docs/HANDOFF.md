# Engineering Handoff

Updated: 2026-07-17

## Exact stopping point

Draft PR [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2) is open and mergeable from `feature/accounts-scorecards-foundation` into `main`. The last feature commit before this documentation reconciliation was `94d60436148cfb80ef6c8bdd91694467f1d290a0`.

The feature branch contains accounts, cloud entry RPCs, weekly scorecard foundations, private groups, favorite-team defaults, Next Team navigation, projected wins, and a Championship Week step that gates the playoff.

## Working state

- GitHub connector writes directly to the remote feature branch; this Codex workspace is not a local checkout of the repository.
- PR #2 remains draft. Do not merge solely because CI is green.
- Latest pre-handoff CI run 106 passed tests and production build.
- Google OAuth was manually confirmed working after registering the exact Lovable Cloud callback.
- Regular-season entry persistence is implemented in code; live cross-device behavior still needs recorded validation.
- Championship picks remain localStorage-only.
- Private-group UI and RPCs exist, but two-account live testing is outstanding.
- Lovable database migration state must be checked rather than inferred from Git.
- Production deployment state may lag this branch.

## Read first

1. `README.md`
2. `docs/ROADMAP.md`
3. `docs/KNOWN_ISSUES.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DECISIONS.md`
6. `docs/VALIDATION.md`
7. PR #2

## Recommended next tasks

1. Reconcile and apply all Lovable migrations.
2. Persist Championship Week picks in versioned cloud entry payloads and locked snapshots.
3. Run two-account group and cross-device entry tests.
4. Validate Apple/email auth, CFBD score sync, deadline locking, and weekly scorecards.
5. Run mobile/desktop smoke tests, update PR #2, mark ready, merge, and verify both hosted surfaces.

## Restart instructions

Repository: `benrempe-LGG/nebraskawinprojection`  
Branch: `feature/accounts-scorecards-foundation`  
PR: https://github.com/benrempe-LGG/nebraskawinprojection/pull/2  
Lovable project: https://lovable.dev/projects/aa959e7e-80e8-43d4-b07c-fd05e6b0a950

Local commands:

```sh
git clone https://github.com/benrempe-LGG/nebraskawinprojection.git
cd nebraskawinprojection
git switch feature/accounts-scorecards-foundation
npm install
npm test
npm run build
npm run dev
```

Then inspect the Lovable migration/database state before changing application behavior.
