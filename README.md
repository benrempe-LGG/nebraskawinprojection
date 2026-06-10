# The P4 Oddsmaker — 2026 Expected Win Calculator

Pick any Power 4 team, set your win probability for each game, and get:

- **Expected wins** (overall + conference) from your own numbers
- **Implied point spreads** for every game (logit model + 2.75 home-field advantage)
- **Win distribution** — the probability of every possible final record, including bowl-eligibility odds
- **Vegas comparison** — enter the sportsbook season win total and see whether your model says over or under

**Live app:** https://benrempe-lgg.github.io/nebraskawinprojection/

## Sharing your projection

- **📋 Copy Forum Post** — copies a ready-to-paste text breakdown of your picks (with a challenge link) for message boards.
- **🔗 Copy Link to My Picks** — your team, all win percentages, and the Vegas total are encoded in the URL. Anyone who opens it sees your exact projection and can tweak it and fire back their own link.
- **📷 Save as Image** — exports the full card as a PNG for posts that allow images.

Predictions also save locally per team, so you can switch schools without losing work.

## Development

```sh
npm install
npm run dev    # dev server on :8080
npm run build  # production build
npm test       # vitest
```

Built with Vite, React, TypeScript, Tailwind, and shadcn/ui. Deploys to GitHub Pages automatically on push to `main` (see `.github/workflows/deploy.yml`).

For entertainment & analysis purposes only. Not affiliated with any university.
