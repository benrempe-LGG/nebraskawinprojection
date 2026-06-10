# P4 Oddsmaker — Architecture & Design

## Overview

The P4 Oddsmaker is a single-page React app that lets college football fans set per-game win probabilities for any Power 4 team and generates expected wins, implied spreads, win distributions, and—crucially—shareable projections for message boards.

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + shadcn/ui. Hosted on Lovable (nebraskawinprojection.lovable.app) with GitHub Pages mirror.

---

## Core Features

### 1. Win Probability Input & Spread Math

Users enter a win % (0–100) for each game. The app converts this to an implied point spread using the logit function:

```
neutral_spread = ln(p/(1-p)) × 8.0
```

Then applies a **2.75-point home-field advantage**:
- Home game: `spread = neutral_spread - 2.75`
- Away game: `spread = neutral_spread + 2.75`

**File:** `src/lib/oddsmaker.ts`

### 2. Win Distribution (Binomial Convolution)

Given per-game probabilities, compute the probability of finishing with exactly k wins using dynamic programming:

```
dp[i][k] = probability of k wins in first i games
```

Used to show:
- Expected total wins (sum of per-game probs)
- Bowl eligibility odds (P(wins ≥ 6))
- Full distribution chart (most likely, bowl zone, .500 zone)

**File:** `src/components/WinDistribution.tsx`

### 3. Shareable Projections (URL Encoding)

The killer feature for board engagement: encode the team, all win %, and Vegas total into the query string.

**Format:**
```
?t=Nebraska&p=90,85,95,55,70,60,30,55,45,75,25,40&v=6.5
```

**Implementation:**
- On load: `parseShareUrl()` pulls params, hydrates the form if present, skips localStorage.
- On save: `buildShareUrl()` encodes current state. User copies the link to challenge others.
- **Key:** empty slots in the `p` array are omitted (e.g., `p=90,85,,55` → only indices 0,1,3 filled).

**File:** `src/pages/Index.tsx` (lines ~50–90, ~230–250)

### 4. Forum Post Generator

**"Copy Forum Post"** button generates a text snapshot suitable for pasting on message boards:

```
🏈 MY 2026 NEBRASKA PROJECTION: 7.3 WINS
Vegas win total: 6.5 → I'm taking the OVER

SEP 5   vs Ohio                 90%
...
Projected record: 7.3–4.7 (4.6 B1G wins)
Bowl eligibility odds: 88%

Think I'm wrong? Post your own numbers: [challenge link]
```

**Record math:** `winsDisplay = round(totalExpectedWins, 1)`, then `losses = gameCount - winsDisplay` so the card always sums to game count (avoids 7.3–4.8 = 12.1).

**File:** `src/pages/Index.tsx` (lines ~240–280)

### 5. Persistence & Vegas Totals

- **Per-team predictions:** localStorage keys are `oddsmaker_preds[teamName] = { gameIdx: winPct, ... }`.
- **Vegas totals:** localStorage key `oddsmaker_vegas_totals[teamName] = "6.5"` (manual entry, no API).
- **Clipboard fallback:** modern `navigator.clipboard` with execCommand fallback for browsers that block clipboard access.

**File:** `src/pages/Index.tsx` (lines ~58–75, ~200–225)

---

## Deployment

### GitHub Pages

**Repo:** https://github.com/benrempe-LGG/nebraskawinprojection (public)

**Workflow:** `.github/workflows/deploy.yml`
- Triggers on push to `main`
- Builds with `DEPLOY_BASE_PATH=/nebraskawinprojection/` (GitHub Pages serves from a repo subdirectory)
- Creates `dist/404.html` as fallback for SPA routing on `/analytics`
- Creates/updates Pages artifact; GitHub Pages automatically deploys

**Live:** https://benrempe-lgg.github.io/nebraskawinprojection/

### Lovable

**Primary URL:** https://nebraskawinprojection.lovable.app/

Lovable syncs from GitHub (main branch), builds with `DEPLOY_BASE_PATH` unset (defaults to `/`), and publishes at domain root.

---

## Host-Agnostic Build

**Challenge:** GitHub Pages serves from `/nebraskawinprojection/`; Lovable serves from `/`.

**Solution:** `vite.config.ts` reads `process.env.DEPLOY_BASE_PATH`:
```typescript
base: process.env.DEPLOY_BASE_PATH || "/"
```

**Workflow sets it:** The GitHub Pages workflow exports `DEPLOY_BASE_PATH=/nebraskawinprojection/` during build. Lovable (and local dev) use the default `/`.

**File:** `vite.config.ts`

---

## Data & Schedules

All 130 Power 4 teams' 2026 schedules are hardcoded in `src/lib/oddsmaker.ts` as a compact structure:

```typescript
const RAW: Record<string, [conf, [[date, opponent, loc], ...]]> = { ... }
```

Expanded at runtime into `ALL_TEAMS[teamName] = { conference, schedule: [...] }` and `CONFERENCES[conf] = [teams]`.

Conference detection (`isConferenceGame`) cross-references opponent's conference.

**Why hardcoded?** Schedules don't change mid-season; no need for an API. Reduces dependencies and cold-start time.

**File:** `src/lib/oddsmaker.ts` (lines 1–65)

---

## Security & API Key Incident

**What happened:** An Odds API key was committed to `src/lib/vegasApi.ts` (removed June 2026). The key was scrubbed from all git history via `git filter-branch`, and the file was deleted entirely.

**What to do:** Rotate the key at the-odds-api.com. GitHub's secret scanner should have flagged it; check if any API requests hit the account from unexpected IPs.

**Why Vegas is now manual:** The Odds API's `/totals` market returned game point totals (e.g., 54.5), not season win totals. Manual entry is more reliable for board engagement anyway—users can compare multiple sportsbooks or use their own lines.

---

## Testing

Unit test placeholder in `src/test/example.test.ts`. No e2e tests yet; the app is simple enough that manual testing in browsers (Chrome, Safari, Firefox) covers the main flows:

1. Load with share URL, verify hydration
2. Enter win %, see spreads and distribution update
3. Copy forum post, verify format and math
4. Switch teams, verify persistence
5. Check localStorage after reload

---

## Next Steps / Ideas

1. **Custom domain:** Point a vanity domain (e.g., `p4oddsmaker.com`) at the Lovable URL via DNS for cleaner sharing.
2. **Team season records:** Prefill win % based on preseason expectations or prior season performance.
3. **Shareable analytics:** Generate charts/images of the win distribution for posts.
4. **Leaderboard:** Track user projections across users (would require a backend).
5. **Mobile refinement:** Test on iPhone/Android, optimize input UX for small screens.
6. **Analytics:** Track which teams users project on, which spreads are most contested.
