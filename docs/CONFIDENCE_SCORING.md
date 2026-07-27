# Confidence Scoring Specification

Status: approved; Units 1-3 implemented and validated in source
Updated: 2026-07-27

## Objective

Use each locked prediction percentage to measure probability quality, not just winner accuracy. Keep correct picks visible, but rank private-group entries by a fair confidence score that rewards accurate conviction and penalizes misplaced conviction.

## Product rules

1. **Confidence Score is the primary group ranking metric.**
2. **Correct Picks remains visible** and is the first tie-breaker.
3. Only locked entries and final, non-tied games are scored.
4. Weekly scores and season-to-date scores use the same formula.
5. Scores are calculated from the immutable normalized prediction rows created at submission and preserved at locking.
6. Scores display on a 0–100 scale with one decimal place. Higher is better.
7. A 50% prediction is the neutral benchmark. It always scores 75.0 and provides no ranking advantage through information or conviction.

## Formula

The stored `predictions.win_probability` is the confidence assigned to the predicted winner.

For each final game:

```text
c = win_probability / 100
y = 1 when the predicted winner won, otherwise 0
game confidence score = 100 × (1 - (c - y)²)
```

The weekly or cumulative Confidence Score is the arithmetic mean of the eligible game scores. This is the complement of the binary Brier score, expressed so higher is better.

Use full precision for calculations and ranking. Round to one decimal place only for display.

## Worked examples

| Prediction | Result | Game score |
|---|---:|---:|
| 100% confidence | correct | 100 |
| 100% confidence | incorrect | 0 |
| 90% confidence | correct | 99 |
| 90% confidence | incorrect | 19 |
| 80% confidence | correct | 96 |
| 80% confidence | incorrect | 36 |
| 60% confidence | correct | 84 |
| 60% confidence | incorrect | 64 |
| 50% confidence | either result | 75 |

Interpretation:

- Above 75 means the entry added useful probability information.
- 75 is equivalent to assigning every game a coin-flip probability.
- Below 75 means misplaced confidence outweighed correct calibration.

## Ranking and tie-breaking

Rank each private group by:

1. unrounded season-to-date Confidence Score, descending
2. Correct Picks, descending
3. display name, ascending, for deterministic presentation

All members are compared across the same set of final catalog games. `games_final` and `confidence_games` must be displayed so a partial or legacy row cannot appear directly comparable without context.

Do not add upset bonuses, favorite penalties, streak multipliers, or manual confidence-point budgets in version 1. Those mechanisms reward game selection strategy rather than probability accuracy.

## Weekly and cumulative behavior

For each week:

- `games_final`: final, non-tied catalog games with a normalized prediction
- `correct_picks`: predicted winner matches actual winner
- `incorrect_picks`: predicted winner does not match actual winner
- `confidence_games`: final, non-tied games with non-null `win_probability`
- `confidence_score`: average game confidence score for that week

Season-to-date Confidence Score must be weighted by games:

```text
sum(weekly confidence score × weekly confidence games)
-------------------------------------------------------
             sum(weekly confidence games)
```

Do not average weekly averages without weighting; weeks can contain different numbers of games.

## Edge cases

### Fifty-percent predictions

- A resolved 50% home-team pick scores 75 regardless of the result.
- Neutral-site 50% predictions remain invalid at submission because they do not identify a winner.

### Missing predictions or confidence

- A complete locked entry should have one normalized prediction per catalog game.
- If a legacy or malformed prediction has null `win_probability`, include it in correct/incorrect accuracy when possible but exclude it from `confidence_games` and Confidence Score.
- Surface the confidence-game count; do not silently treat missing confidence as 50%.

### Tied results

- Exclude a final game with equal scores from accuracy and confidence scoring.
- Treat it as a data-quality exception because current FBS games should resolve a winner.
- This corrects the existing view behavior that implicitly treats equal scores as an away-team win.

### Postponed and canceled games

- Do not score them.
- If a postponed game later becomes final, include it in its canonical catalog week unless product requirements later introduce a played-week concept.

### Corrections to final scores

- Views and RPC results recompute from current canonical game results.
- A provider correction therefore updates scorecards automatically.
- Record operational evidence for any correction that changes group standings.

### Locked-entry integrity

- Confidence scoring must read normalized predictions associated with a locked ballot.
- Never score from editable browser storage or a draft payload.
- The scoring migration must not rewrite `draft_payload`, `locked_payload`, or existing normalized predictions.

## User experience

### Group leaderboard

Recommended columns:

- Rank
- Player
- Confidence Score
- Correct Picks
- Games Scored

Recommended helper text:

> Confidence Score measures how accurate your percentages were. Higher-confidence correct picks help more, while high-confidence misses hurt more. A score of 75 is the 50/50 benchmark.

### Scorecards

Season summary:

- Confidence Score, one decimal
- `correct of final` picks
- pick accuracy percentage
- short `75 = 50/50 benchmark` label

Weekly card:

- week number
- weekly Confidence Score
- correct–incorrect record
- games scored

Do not label the result simply “confidence”; that could be mistaken for average boldness. Use the full label **Confidence Score**.

### Empty state

Keep the existing message that scorecards begin after locking and final results. Do not display a zero Confidence Score before any eligible game; display an em dash or “Not scored yet.”

## Data and query impact

No new table is required.

Existing data already provides:

- `predictions.predicted_winner_id`
- `predictions.win_probability`
- `games.home_team_id`
- `games.away_team_id`
- `games.home_score`
- `games.away_score`
- `games.status`
- locked ballot identity and season

Implementation should use one forward-only migration to:

1. replace `public.weekly_scorecards` with confidence columns and tied-result exclusion
2. replace `public.get_group_leaderboard(uuid)` with confidence totals and ranking order
3. preserve the existing membership check, security-definer search path, grants, and row isolation
4. regenerate `src/integrations/supabase/types.ts`

Recommended additional view columns:

```text
confidence_games integer
confidence_score numeric
```

Recommended RPC additions:

```text
confidence_games integer
confidence_score numeric
```

## Required test cases

Calculation tests:

1. 100% correct = 100
2. 100% incorrect = 0
3. 80% correct = 96
4. 80% incorrect = 36
5. 50% either result = 75
6. weekly aggregation uses the arithmetic mean
7. cumulative aggregation is weighted by games, not weeks
8. ranking uses unrounded confidence values

Data tests:

9. only locked ballots are scored
10. scheduled, in-progress, postponed, and canceled games are excluded
11. equal final scores are excluded
12. null confidence is excluded from confidence calculations but does not crash the query
13. corrected final scores recompute the score
14. group membership remains required
15. members cannot read another private group's leaderboard
16. correct picks break an exact confidence tie

UI tests:

17. no-games state shows “Not scored yet,” not zero
18. weekly and season confidence values render to one decimal
19. benchmark explanation is visible
20. leaderboard order follows the RPC result

## Implementation plan

### Unit 1 — Pure scoring helper

- Add a TypeScript confidence-score helper and unit tests for formula examples and aggregation.
- Keep the helper independent of React and Supabase.

Definition of done: calculation and aggregation tests pass with full precision.

Implemented 2026-07-27 in `src/lib/confidenceScore.ts`. The helper validates
the stored 50-100 confidence range, excludes missing confidence and unresolved
results, preserves unrounded point totals, and combines periods by eligible
games rather than by unweighted period averages.

### Unit 2 — Database scoring migration

- Replace the weekly scorecard view and group leaderboard RPC.
- Add SQL validation fixtures for eligibility, ties, null confidence, weighted totals, ranking, and membership.
- Regenerate database types.

Definition of done: forward migration validates cleanly, existing RLS behavior is preserved, and known fixtures match the TypeScript helper.

Implemented and validated 2026-07-27. The forward-only migration extends the
security-invoker weekly scorecard, replaces the membership-gated leaderboard
RPC, preserves full precision, and adds CI contract checks plus a rollback-only
SQL fixture. The migration and fixture passed in an ephemeral in-memory
PostgreSQL runtime. This validates SQL execution and behavior without applying
the migration to production.

### Unit 3 — Scorecard and leaderboard UI

- Add Confidence Score, benchmark copy, correct picks, and games scored.
- Retain accessible loading, empty, and error states.
- Keep mobile layout usable at the existing beta breakpoints.

Definition of done: scorecards and groups render correct weekly/cumulative values on desktop and mobile, with no change to entry creation or locking.

Implemented and validated in source 2026-07-27. Scorecards show weekly and
game-weighted season values to one decimal, preserve accuracy context, explain
the 75 benchmark, and use `Not scored yet` for empty confidence. Private groups
render the RPC's confidence-first order with Correct Picks and both eligible
game counts. Responsive layouts and page tests cover phone-safe stacking,
display precision, empty state, benchmark copy, weighting, and RPC order.

Unit 3 must not be published before the Unit 2 migration is applied.

### Unit 4 — Production validation

- Wait for a real final 2026 game or use a separately approved production-safe fixture design.
- Capture locked-ballot and game-result before-state.
- Verify weekly scorecard, season total, group order, and idempotent result refresh.

Definition of done: production evidence agrees with hand calculations and no editable or locked payload changes.

## Out of scope

- Changing how users enter percentages
- Multiple entries per account
- Confidence-point budgets
- Upset bonuses
- Against-the-spread scoring
- Championship Week confidence percentages
- Public leaderboards
- Historical recalibration or model-quality analytics
