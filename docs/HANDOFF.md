# Engineering Handoff

Updated: 2026-07-20

## Exact stopping point

Draft PR [#2](https://github.com/benrempe-LGG/nebraskawinprojection/pull/2) is open, mergeable, and 91 commits ahead of `main`. It remains on `feature/accounts-scorecards-foundation`.

The feature head before this documentation reconciliation was `aeb8ad9e1276af2ad6c36981ac0a75b74c84b9f3` (`Ensure review anchors scroll after render`). GitHub Actions run 132 passed. Use the branch or PR head, rather than this pre-handoff SHA, after the documentation commit lands.

No local checkout exists in the Codex workspace. GitHub connector writes are the repository working state, so there is no local uncommitted working tree to preserve.

## Working state

- Accounts, one official entry per user, cloud draft/submission/locking RPCs, weekly scorecard foundations, private groups, favorite-team defaults, Next Team navigation, standings projections, and Championship Week are implemented on the feature branch.
- Regular-season and Championship Week selections now use a version 2 cloud entry payload with legacy flat-payload compatibility.
- `My Entry` and persistent navigation provide the main signed-in workflow.
- Google OAuth was manually confirmed after the exact Lovable Cloud callback was registered.
- Lovable preview at the feature head passed route, desktop, 390-pixel phone, review-anchor, and accessibility QC.
- Production contains the account and entry experience, but the final July 20 anchor, mobile-nav, and accessibility corrections are still unpublished.
- PR #2 is intentionally still a draft. There are no PR review comments.

## Repository and deployment state

Repository: `benrempe-LGG/nebraskawinprojection`  
Branch: `feature/accounts-scorecards-foundation`  
PR: https://github.com/benrempe-LGG/nebraskawinprojection/pull/2  
Lovable project: https://lovable.dev/projects/aa959e7e-80e8-43d4-b07c-fd05e6b0a950  
Production: https://nebraskawinprojection.lovable.app/

GitHub remote is configured through the connector. The intended repository boundary is this repository only; the surrounding Codex workspace is not a checkout and must not be initialized as the project repository.

## Important unvalidated state

- Lovable's exact applied-migration ledger, including duplicate manual and generated versioned-payload migrations
- Cross-device restoration of draft, submitted, and locked version 2 payloads
- Two-account private-group RLS, invitation, OAuth return, and leaderboard behavior
- Apple and email-link authentication
- CFBD secret configuration, rejection behavior, team mapping, score ingestion, and weekly scorecard population
- Deadline scheduler and automatic locking
- Signed-in production regression after the pending Lovable update
- Lint, standalone type checking, and browser end-to-end automation

## Security and hygiene

- No credentials were present in the inspected configuration, changed source, or canonical documentation; only environment-variable names and the public OAuth callback are documented. This was not a full-history secret scan.
- `.gitignore` excludes dependencies, builds, logs, local files, and common editor state.
- The score-sync function currently fails open when `SYNC_SECRET` is absent. Fix this before enabling scheduled or public invocation.
- Both `package-lock.json` and `bun.lock` are tracked; CI uses npm. Avoid removing either until the Lovable workflow and canonical package manager are explicitly reconciled.
- Do not delete either versioned-payload migration until the applied migration ledger is understood.

## Read first

1. `README.md`
2. `docs/ROADMAP.md`
3. `docs/KNOWN_ISSUES.md`
4. `docs/ARCHITECTURE.md`
5. `docs/DECISIONS.md`
6. `docs/VALIDATION.md`
7. PR #2

## Recommended next tasks

1. Reconcile the Lovable migration ledger and confirm the deployed version 2 RPC definitions.
2. Make `sync-cfbd-scores` fail closed, configure secrets, and validate a controlled score-sync invocation.
3. Run two-account group and cross-device entry tests, including locked Championship Week restoration.
4. Publish the current Lovable preview, then run signed-in desktop and phone production smoke tests.
5. Validate Apple/email auth and deadline locking, update PR #2, mark ready, merge, and verify both hosted surfaces.

## Restart instructions

```sh
git clone https://github.com/benrempe-LGG/nebraskawinprojection.git
cd nebraskawinprojection
git switch feature/accounts-scorecards-foundation
npm install
npm test
npm run build
npm run dev
```

Then read the documents above and inspect Lovable's migration and production state before changing application behavior.
