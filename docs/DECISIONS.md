
## 2026-07-21 — One official entry per account during beta

Decision: each authenticated account has one official 2026 entry, and that same entry appears in every private group the user joins.

Rationale: one-person, one-prediction keeps identity, locking, scoring, and beta support understandable.

Consequences: multiple March Madness-style named entries are deferred until entry identity, group standings, and scorecards can distinguish them safely.

## 2026-07-21 — Serialize automatic browser saves

Decision: queue cloud writes from each active page and write the newest queued payload last while exposing truthful save states.

Rationale: overlapping asynchronous requests could otherwise finish out of order and silently replace newer picks.

Consequences: one-page races are protected and users can see failure. Simultaneous editing from separate devices still needs server-side concurrency or revisions.

## 2026-07-21 — Friends-and-family beta before merge

Decision: keep PR #2 draft while inviting a small group of real users into the live production experience.

Rationale: authentication, groups, complete submission, and cloud saves pass controlled QC, while real-device restoration, scoring, and locking still benefit from beta evidence.

Consequences: Google and email are supported beta paths; Apple remains unadvertised; beta findings take priority over new feature work.

# Decision Log

## 2026-07-20 — Version cloud entries

Decision: use a version 2 cloud payload containing canonical regular-season predictions and Championship Week winners.

Rationale: one official entry must restore and lock every selection that affects the playoff field.

Consequences: legacy flat payloads remain readable, Championship Week can restore across devices, and the Lovable migration ledger must include the versioned-payload RPC changes.

## 2026-07-20 — Persistent entry navigation

Decision: add a persistent site navigation bar and a dedicated My Entry dashboard.

Rationale: authenticated users need an obvious place to sign in, resume their entry, reach Championship Week, review scorecards, and manage private groups.

Consequences: responsive navigation and route accessibility are release criteria.

## 2026-07-17 — Lovable Cloud as the application backend

Decision: use Lovable's Supabase-compatible database and authentication rather than require a separately visible Supabase project.

Rationale: it is native to the deployment workflow and supports authentication, RLS, migrations, RPCs, and Edge Functions.

Consequences: database state and migrations must be verified through Lovable. A repository migration is not evidence that production applied it.

## 2026-07-17 — Entry lifecycle

Decision: model a March Madness-style entry as draft, submitted, then locked at the deadline.

Rationale: users understand an entry that can be revised before a deadline better than an immediate irreversible lock.

Consequences: scorecards use the immutable locked payload. Submitted entries may reopen only before the deadline.

## 2026-07-17 — Favorite-team personalization

Decision: store a signed-in user's favorite team in their profile and cache it locally.

Rationale: the predictor should open on the user's team instead of always defaulting to Nebraska.

## 2026-07-17 — Championship Week gates the playoff

Decision: derive the top two teams from each P4 conference, require the user to pick all four championship games, adjust participant records, and only then reveal the playoff field.

Rationale: the playoff field should reflect conference title-game outcomes rather than treating regular-season leaders as champions.

Consequence: official conference tiebreakers remain simplified.

## 2026-07-17 — Private groups use invitation codes

Decision: groups are private by default and joined through an eight-character code or shareable link.

Rationale: it provides a low-friction friends-and-family competition without public discovery or complex moderation.

Consequence: commissioner controls are limited, and two-account production testing is required.

## 2026-07-15 — Canonical matchup identity

Decision: identify a regular-season game by season and alphabetically ordered team pair, excluding date.

Rationale: source schedules disagreed on dates and created duplicate records.

Consequence: both team pages stay synchronized; same-season rematches require a distinct identity layer.

## 2026-07-15 — Home team breaks a 50% tie

Decision: a 50% home game defaults to the home team; a neutral 50% game remains unresolved.

## 2026-07-15 — Transparent playoff proxy

Decision: favor SEC and Big Ten résumés, track Notre Dame separately, normally constrain ACC and Big 12 representation, and reserve a G6 slot.

Consequence: coefficients are assumptions and require continued scenario testing.

## Decision Required — Score-sync authentication

Conflict: the score-sync function uses service-role access but accepts unauthenticated triggers when `SYNC_SECRET` is absent.

Options:

1. Fail closed unless the secret exists and matches.
2. Restrict invocation through another authenticated scheduler mechanism.
3. Leave the current optional-secret behavior.

Recommendation: fail closed and test the configured scheduler before enabling score ingestion.

Impact of delay: an accidentally unconfigured deployment could expose a privileged, resource-consuming endpoint.

## Decision Required — Merge readiness

Conflict: feature code, versioned entry persistence, preview QC, and CI are healthy, but migration-ledger reconciliation, production publication, two-account groups, cross-device locked-entry restore, Apple/email auth, CFBD sync, and deadline locking remain incomplete.

Options: merge as an explicitly incomplete beta, or complete the integration-beta exit criteria first.

Recommendation: keep PR #2 in draft until the Now roadmap exit criteria are recorded.

Impact of delay: production remains on a known state while the team avoids merging partially verified external integrations.
