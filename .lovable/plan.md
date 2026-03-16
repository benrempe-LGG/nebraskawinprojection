

## Plan: Black header + replace yellow/gold with gray/white

### Changes

**1. `src/index.css` — Update CSS variables and utilities**
- Change `--accent` from gold (`45 100% 65%`) to a clean light gray (`0 0% 75%`) — readable on dark backgrounds without being yellow
- Change `--accent-foreground` to white
- Change `.gradient-header` to a black gradient (e.g., `hsl(0 0% 4%)` → `hsl(0 0% 8%)`) to match the logo's black background
- Remove the red border-bottom shadow on the header or make it subtle
- Update `.glow-gold` to use a white/gray glow instead of gold

**2. `src/pages/Index.tsx` — Header styling**
- Change the header's `border-b-4 border-accent` to `border-primary` (scarlet) or remove it, since accent is no longer gold
- The subtitle text currently uses `text-accent` — this will automatically pick up the new gray, which works well as a subdued subtitle

**3. `src/components/GameRow.tsx` — No changes needed**
- `text-accent` references will automatically use the new gray value
- The "neutral" spread sentiment uses `text-accent` which will become gray — appropriate

**4. `src/components/SummaryCards.tsx` — No changes needed**  
- Expected Wins big number uses `text-accent glow-gold` — both will become gray/white automatically
- Vegas input text uses `text-accent` — will become gray, fine
- Neutral diff comparison uses `text-accent` — will become gray, appropriate

All yellow references flow through the `--accent` CSS variable, so one change covers the entire app.

