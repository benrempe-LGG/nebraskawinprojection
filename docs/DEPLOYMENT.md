# Deployment Guide

## Overview

The P4 Oddsmaker is deployed to two hosts:
1. **Lovable** (primary) — https://nebraskawinprojection.lovable.app/
2. **GitHub Pages** (mirror) — https://benrempe-lgg.github.io/nebraskawinprojection/

Both auto-deploy when code is pushed to the main branch on GitHub.

---

## Local Development

```bash
npm install
npm run dev          # Vite dev server on :8080
npm run build        # Production build (base path = /)
npm test             # Unit tests
npm run lint         # ESLint
```

The app loads at `http://localhost:8080` with hot module reload.

---

## GitHub to Lovable Sync

1. **Push to main branch:** `git push origin main`
2. **Lovable syncs automatically** from the GitHub repo (configured in Lovable project settings).
3. **Lovable rebuilds & publishes** within ~1 minute.

If Lovable shows a sync error or old code, reconnect the GitHub integration in **Project → Settings → Integrations**.

---

## Publishing from Lovable

After Lovable syncs the latest code:

1. Open the Lovable project
2. Click **Share** → **Publish**
3. Wait ~30 seconds for the build to complete
4. Confirm the update appears on https://nebraskawinprojection.lovable.app/

The public URL does not require authentication.

---

## GitHub Pages Deploy

The `.github/workflows/deploy.yml` workflow runs on every push to main:

1. **Checkout** the code
2. **Install dependencies** with `npm ci`
3. **Build** with `DEPLOY_BASE_PATH=/nebraskawinprojection/` (GitHub Pages serves from a subdirectory)
4. **Create `dist/404.html`** as the SPA fallback (so `/analytics` route works)
5. **Upload artifact** to GitHub Pages
6. **Deploy** the artifact

**Live URL:** https://benrempe-lgg.github.io/nebraskawinprojection/ (updates within 2 minutes of push)

### Environment Variables

- `DEPLOY_BASE_PATH=/nebraskawinprojection/` — tells Vite where assets will be served from.

### Workflow File

File: `.github/workflows/deploy.yml`

Triggers: push to main, manual dispatch via `workflow_dispatch`.

---

## Secrets & Security

- **GitHub token** (`GITHUB_TOKEN`): Provided by GitHub Actions, automatically scoped to the repo. No additional secrets needed.
- **API keys**: None. The Odds API key was removed in June 2026; Vegas totals are now manual entry.

---

## Troubleshooting

### Deploy Fails with "Resource not accessible by integration"

**Cause:** GitHub Pages site doesn't exist or the workflow token lacks permissions.

**Fix:** 
1. Go to **Settings → Pages**.
2. Ensure **Source** is set to **Deploy from a branch** or **GitHub Actions**.
3. If the Pages site is new, create it via the Pages API or manually trigger a rebuild:
   ```bash
   curl -X POST -H "Authorization: Bearer $TOKEN" \
     -d '{"ref":"main"}' \
     https://api.github.com/repos/benrempe-LGG/nebraskawinprojection/actions/workflows/deploy.yml/dispatches
   ```

### Build Succeeds but Assets Don't Load

**Cause:** Vite's `base` path doesn't match the hosting path.

**Fix:** Check `vite.config.ts`—it should read `process.env.DEPLOY_BASE_PATH` at build time. For GitHub Pages, the workflow must set `DEPLOY_BASE_PATH=/nebraskawinprojection/`.

### Lovable Shows Old Code

**Cause:** GitHub sync is stale or disconnected.

**Fix:** 
1. Go to **Project → Settings → Integrations**.
2. Disconnect and reconnect the GitHub repo.
3. Wait 30s for Lovable to pull the latest commit from main.
4. Verify the code in the editor, then Publish.

---

## Rollback

If a bad deploy goes live:

1. **Revert the commit:** `git revert <commit-hash>`
2. **Push to main:** `git push origin main`
3. Both GitHub Pages and Lovable redeploy within 2 minutes.

Or manually trigger a previous commit:
```bash
git push origin <previous-commit>:main --force
```
(Use `--force` sparingly; only for emergencies.)

---

## Monitoring

No automated monitoring is in place. To check deploy status:

- **GitHub Pages:** Check `.github/workflows/deploy.yml` run history in the **Actions** tab.
- **Lovable:** Check the **Deployments** tab in the Lovable project.
- **Uptime:** Navigate to https://nebraskawinprojection.lovable.app/ and https://benrempe-lgg.github.io/nebraskawinprojection/ to verify both are live.

---

## Future Improvements

1. **Custom domain:** Add a CNAME file or DNS record to point a vanity domain at the Lovable URL.
2. **Analytics:** Log page views, share link clicks, and team popularity to understand which teams users project on.
3. **CI/CD enhancements:** Add automated smoke tests (Playwright) to the workflow to catch rendering issues pre-deploy.
