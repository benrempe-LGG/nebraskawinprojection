#!/usr/bin/env node
/**
 * Migration-history validator.
 *
 * Fails on:
 *   1. Duplicate migration identities (timestamp prefix or full filename collisions).
 *   2. Known descriptive-twin filenames (e.g. YYYYMMDD_description.sql without a
 *      UUID suffix) that would shadow the reconciled UUID-suffixed ledger.
 *   3. Duplicate CREATE TYPE / CREATE TABLE targets across the ordered chain
 *      (bare form, without IF NOT EXISTS), which cause fresh-apply conflicts.
 *   4. A latest submit_entry definition that uses unsupported jsonb_object_length
 *      instead of PostgreSQL-17-compatible jsonb_object_keys counting.
 *   5. Confidence scoring definitions that lose locked-ballot, tied-game,
 *      weighted-aggregation, or private-group membership boundaries.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIR = "supabase/migrations";
const errors = [];

let entries;
try {
  entries = readdirSync(DIR).filter((f) => f.endsWith(".sql"));
} catch (e) {
  console.error(`Cannot read ${DIR}: ${e.message}`);
  process.exit(1);
}
entries.sort();

// Expected reconciled format: <14-digit-timestamp>_<uuid>.sql
const CANONICAL = /^\d{14}_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.sql$/;
// Descriptive twin: timestamp followed by non-uuid text like _accounts_scorecards_foundation.
const DESCRIPTIVE_TWIN = /^\d{12,14}_[a-z][a-z0-9_]*\.sql$/i;

const timestamps = new Map();
for (const name of entries) {
  if (!CANONICAL.test(name)) {
    if (DESCRIPTIVE_TWIN.test(name)) {
      errors.push(`Descriptive-twin migration filename not allowed: ${name}`);
    } else {
      errors.push(`Migration filename does not match reconciled <timestamp>_<uuid>.sql pattern: ${name}`);
    }
    continue;
  }
  const ts = name.slice(0, 14);
  if (timestamps.has(ts)) {
    errors.push(`Duplicate migration timestamp ${ts}: ${timestamps.get(ts)} vs ${name}`);
  } else {
    timestamps.set(ts, name);
  }
}

// Duplicate CREATE TYPE / CREATE TABLE detection across chain.
// Ignore CREATE ... IF NOT EXISTS and CREATE OR REPLACE forms.
const createdTypes = new Map();
const createdTables = new Map();
const stmtType = /create\s+type\s+([a-z0-9_."]+)/gi;
const stmtTable = /create\s+table\s+(?!if\s+not\s+exists)([a-z0-9_."]+)/gi;
const stmtTableSafe = /create\s+table\s+if\s+not\s+exists\s+([a-z0-9_."]+)/gi;
let latestSubmitEntry = null;
let latestWeeklyScorecards = null;
let latestGroupLeaderboard = null;
let migrationChain = "";

function stripComments(sql) {
  return sql
    .replace(/--[^\n]*\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

for (const name of entries) {
  const path = join(DIR, name);
  if (!statSync(path).isFile()) continue;
  const raw = stripComments(readFileSync(path, "utf8"));
  migrationChain += `\n${raw}`;
  const submitEntryIndex = raw
    .toLowerCase()
    .lastIndexOf("create or replace function public.submit_entry");
  if (submitEntryIndex >= 0) {
    latestSubmitEntry = { name, sql: raw.slice(submitEntryIndex) };
  }
  const weeklyScorecardsIndex = raw
    .toLowerCase()
    .lastIndexOf("create or replace view public.weekly_scorecards");
  if (weeklyScorecardsIndex >= 0) {
    latestWeeklyScorecards = { name, sql: raw.slice(weeklyScorecardsIndex) };
  }
  const groupLeaderboardIndex = raw
    .toLowerCase()
    .lastIndexOf("create function public.get_group_leaderboard");
  if (groupLeaderboardIndex >= 0) {
    latestGroupLeaderboard = { name, sql: raw.slice(groupLeaderboardIndex) };
  }

  for (const m of raw.matchAll(stmtType)) {
    const id = m[1].toLowerCase();
    if (createdTypes.has(id)) {
      errors.push(`Duplicate CREATE TYPE ${id}: ${createdTypes.get(id)} and ${name}`);
    } else {
      createdTypes.set(id, name);
    }
  }
  for (const m of raw.matchAll(stmtTable)) {
    const id = m[1].toLowerCase();
    if (createdTables.has(id)) {
      errors.push(`Duplicate CREATE TABLE ${id}: ${createdTables.get(id)} and ${name}`);
    } else {
      createdTables.set(id, name);
    }
  }
  // Track CREATE TABLE IF NOT EXISTS occurrences as well so later bare CREATE TABLE on same target still flags.
  for (const m of raw.matchAll(stmtTableSafe)) {
    const id = m[1].toLowerCase();
    if (!createdTables.has(id)) createdTables.set(id, name);
  }
}

if (!latestSubmitEntry) {
  errors.push("No public.submit_entry definition found in migration history.");
} else if (/jsonb_object_length\s*\(/i.test(latestSubmitEntry.sql)) {
  errors.push(
    `Latest submit_entry definition in ${latestSubmitEntry.name} uses unsupported jsonb_object_length(jsonb).`
  );
} else if (
  !/from\s+jsonb_object_keys\s*\(\s*predictions_payload\s*\)/i.test(
    latestSubmitEntry.sql
  )
) {
  errors.push(
    `Latest submit_entry definition in ${latestSubmitEntry.name} must count predictions with jsonb_object_keys.`
  );
}

if (!latestWeeklyScorecards) {
  errors.push("No replaceable public.weekly_scorecards definition found.");
} else {
  const requiredScorecardPatterns = [
    [/security_invoker\s*=\s*true/i, "remain a security-invoker view"],
    [/where\s+b\.status\s*=\s*'locked'/i, "score only locked ballots"],
    [/g\.home_score\s*<>\s*g\.away_score/i, "exclude tied results"],
    [/p\.win_probability\s+is\s+not\s+null/i, "exclude null confidence"],
    [/as\s+confidence_games/i, "return confidence_games"],
    [/as\s+confidence_score/i, "return confidence_score"],
  ];
  for (const [pattern, requirement] of requiredScorecardPatterns) {
    if (!pattern.test(latestWeeklyScorecards.sql)) {
      errors.push(
        `Latest weekly_scorecards definition in ${latestWeeklyScorecards.name} must ${requirement}.`
      );
    }
  }
}

for (const [pattern, requirement] of [
  [/revoke\s+all\s+privileges\s+on\s+public\.weekly_scorecards\s+from\s+public/i, "revoke public scorecard-view privileges"],
  [/revoke\s+all\s+privileges\s+on\s+public\.weekly_scorecards\s+from\s+anon/i, "revoke anonymous scorecard-view privileges"],
]) {
  if (!pattern.test(migrationChain)) {
    errors.push(`Migration history must ${requirement}.`);
  }
}

if (!latestGroupLeaderboard) {
  errors.push("No public.get_group_leaderboard confidence definition found.");
} else {
  const requiredLeaderboardPatterns = [
    [/if\s+not\s+public\.is_group_member\s*\(\s*target_group\s*\)/i, "require group membership"],
    [/security\s+definer\s+set\s+search_path\s*=\s*''/i, "retain a fixed security-definer search path"],
    [/sum\s*\(\s*ws\.confidence_score\s*\*\s*ws\.confidence_games\s*\)/i, "weight confidence by games"],
    [/confidence_score\s+desc\s+nulls\s+last/i, "rank by unrounded confidence"],
    [/correct_picks\s+desc/i, "use correct picks as the first tie-breaker"],
    [/revoke\s+all\s+privileges\s+on\s+function\s+public\.get_group_leaderboard\s*\(\s*uuid\s*\)\s+from\s+public/i, "revoke public execution"],
    [/grant\s+execute\s+on\s+function\s+public\.get_group_leaderboard\s*\(\s*uuid\s*\)\s+to\s+authenticated/i, "grant execution only to signed-in users and trusted roles"],
  ];
  for (const [pattern, requirement] of requiredLeaderboardPatterns) {
    if (!pattern.test(latestGroupLeaderboard.sql)) {
      errors.push(
        `Latest get_group_leaderboard definition in ${latestGroupLeaderboard.name} must ${requirement}.`
      );
    }
  }
}

const confidenceFixturePath = "supabase/tests/confidence_scoring.sql";
let confidenceFixture = "";
try {
  confidenceFixture = readFileSync(confidenceFixturePath, "utf8");
} catch (e) {
  errors.push(`Cannot read ${confidenceFixturePath}: ${e.message}`);
}
for (const [pattern, requirement] of [
  [/\brollback\s*;/i, "roll back fixture data"],
  [/232::numeric\s*\/\s*3/i, "assert game-weighted season scoring"],
  [/array\['Alpha',\s*'Gamma',\s*'Beta'\]/i, "assert ranking and correct-pick tie-breaking"],
  [/Group membership required/i, "assert non-member rejection"],
  [/Corrected-result recomputation/i, "assert corrected final-score recomputation"],
]) {
  if (confidenceFixture && !pattern.test(confidenceFixture)) {
    errors.push(`Confidence SQL fixture must ${requirement}.`);
  }
}

if (errors.length) {
  console.error("Migration history validation FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Migration history OK. ${entries.length} migrations, no duplicate identities or CREATE conflicts.`);
