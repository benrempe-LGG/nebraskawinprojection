# Beta Operations and Entry Recovery

This runbook protects real user entries during the 2026 private beta.

## Non-negotiable data rules

- A normal frontend publish must never reset, reseed, or rewrite existing ballots.
- Production data tasks must identify one exact user and season before any write.
- Never modify a locked ballot or its `locked_payload`.
- Never use broad `UPDATE`, `DELETE`, reseed, or truncate operations against production ballot data.
- Apply database changes through forward-only, tracked migrations.
- Record before-and-after status, version, prediction count, championship-pick count, and timestamps for every production repair.
- Keep test accounts and test groups clearly named and scoped.

## Before each production deployment

1. Confirm GitHub Actions passes lint, typecheck, tests, migration validation, and build.
2. Review every new migration for destructive statements and unscoped data changes.
3. Record the current branch head and Lovable publish state.
4. Capture read-only aggregate counts for profiles, ballots by status, predictions, groups, and memberships.
5. For entry-related changes, capture the affected test ballot's status, version, prediction count, championship-pick count, `updated_at`, `submitted_at`, and `locked_at`.
6. Publish only after the source and production migration ledger agree.

## Production smoke test

Use dedicated test accounts, never a real user's entry.

1. Sign in and confirm the correct display name.
2. Change one prediction and observe `Saving changes…` followed by `Saved to your account`.
3. Refresh and verify that prediction returns.
4. Open the same account in a second browser or device and verify the cloud entry matches.
5. Change a different prediction on the second device, wait for `Saved`, then refresh the first device.
6. Complete Championship Week and submit through the real `submit_entry` RPC.
7. Verify the submitted entry remains editable until the deadline.
8. Verify another account and the group owner were unchanged.
9. Do not test locking against the real 2026 deadline; use a temporary test season.

## Recovery procedure

If a signed-in user's picks appear missing:

1. Stop entry-related deployments and avoid asking the user to re-enter picks.
2. Record the user's account identifier, season, page, device, and approximate last successful save time.
3. Query the exact ballot read-only. Capture status, timestamps, `draft_payload`, and `locked_payload` metadata.
4. Determine whether the issue is display/hydration, account mismatch, a stale browser cache, or an actual database write.
5. If the database payload is intact, fix hydration and do not rewrite the ballot.
6. If an authorized repair is required, restore only that exact user-season row inside a transaction, with before-and-after evidence.
7. Never replace a non-null locked snapshot. Escalate any locked-entry discrepancy before writing.
8. Reopen production only after the affected account and an unaffected control account both pass refresh and cross-device checks.

## Conflict policy

Automatic saves are serialized in the browser and the newest queued payload is written last. The UI must expose loading, waiting, saving, saved, and failed states. Users should wait for a saved state before closing the page or switching devices.

This client protection does not replace server-side history. A future hardening milestone should add immutable ballot revisions or optimistic concurrency so two simultaneously active devices cannot silently overwrite one another.

## Incident record

For any production incident, record:

- date and time
- branch and commit
- affected account count
- affected season and ballot states
- root cause
- repair performed
- verification evidence
- preventive test or migration guard added
