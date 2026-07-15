# Decision Log

## 2026-07-15 — Canonical matchup identity

Decision: identify a game by season and alphabetically ordered team pair, excluding date.

Rationale: team schedule sources disagreed on dates and created duplicate records for the same matchup.

Consequences: picks synchronize from either schedule and legacy records can collapse safely. A rematch in the same season would require an expanded identifier.

## 2026-07-15 — Home team breaks a 50% tie

Decision: a 50% home game defaults to the home team; a neutral 50% game remains unresolved.

Rationale: it gives an actionable default consistent with home-field advantage while preserving ambiguity at neutral sites.

## 2026-07-15 — Local-first ballot snapshots

Decision: store immutable locked ballots in browser localStorage for the foundation release.

Rationale: it delivers the workflow without blocking on authentication and backend design.

Consequence: ballots are not recoverable across devices or after storage is cleared.

## 2026-07-15 — ACC transition schedule

Decision: model the official 2026 transition with 12 ACC teams playing nine league games and Boston College, Clemson, Florida State, Georgia Tech, and North Carolina playing eight.

## 2026-07-15 — Transparent playoff proxy

Decision: favor SEC and Big Ten résumés, track Notre Dame separately, normally cap ACC and Big 12 at three combined selections, and reserve a G6 slot.

Rationale: this matched the intended modern committee behavior better than conference-balanced selection.

Consequence: the coefficients are product assumptions and need scenario tests before becoming a durable ranking model.

## Decision required — Production positioning

Conflict: the feature set is compelling, but the full schedule/date audit and manual device QA are incomplete.

Options: launch immediately as production, launch explicitly as beta after the audit, or keep the feature branch private.

Recommendation: complete the audit and QA, then launch as a labeled public beta.

Impact of delay: the current production site remains on the older feature set, but avoids publishing known schedule uncertainty.
