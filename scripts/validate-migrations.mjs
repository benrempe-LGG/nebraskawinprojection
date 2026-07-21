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

function stripComments(sql) {
  return sql
    .replace(/--[^\n]*\n/g, "\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

for (const name of entries) {
  const path = join(DIR, name);
  if (!statSync(path).isFile()) continue;
  const raw = stripComments(readFileSync(path, "utf8"));

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

if (errors.length) {
  console.error("Migration history validation FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log(`Migration history OK. ${entries.length} migrations, no duplicate identities or CREATE conflicts.`);