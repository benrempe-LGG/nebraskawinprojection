interface SummaryCardsProps {
  totalExpectedWins: number;
  filledCount: number;
  totalGames: number;
  confWins: number;
  confGameCount: number;
  confAbbr: string;
  vegasTotal: string;
  onVegasTotalChange: (value: string) => void;
  vegasLoading?: boolean;
  vegasSource?: string | null;
}

const SummaryCards = ({
  totalExpectedWins,
  filledCount,
  totalGames,
  confWins,
  confGameCount,
  confAbbr,
  vegasTotal,
  onVegasTotalChange,
  vegasLoading,
  vegasSource,
}: SummaryCardsProps) => {
  const vegasNum = parseFloat(vegasTotal);
  const vegasDiff =
    !isNaN(vegasNum) && filledCount === totalGames
      ? (totalExpectedWins - vegasNum).toFixed(1)
      : null;
  const diffNum = vegasDiff ? parseFloat(vegasDiff) : 0;

  return (
    <div className="max-w-[900px] mx-auto mt-7 px-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Expected Wins */}
      <div className="gradient-card border border-border rounded-lg p-6 text-center">
        <div className="text-[11px] uppercase tracking-[2px] text-muted-foreground mb-2 font-display">
          Expected Wins
        </div>
        <div className="text-5xl font-black text-accent glow-gold leading-none font-display">
          {totalExpectedWins.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 font-mono-data">
          of {totalGames} games ({filledCount} entered)
        </div>
      </div>

      {/* Conference Wins */}
      <div className="gradient-card border border-border rounded-lg p-6 text-center">
        <div className="text-[11px] uppercase tracking-[2px] text-muted-foreground mb-2 font-display">
          Conference Wins
        </div>
        <div className="text-5xl font-black text-primary glow-scarlet leading-none font-display">
          {confWins.toFixed(1)}
        </div>
        <div className="text-xs text-muted-foreground mt-1.5 font-mono-data">
          of {confGameCount} {confAbbr} games
        </div>
      </div>

      {/* Vegas Comparison */}
      <div className="gradient-card border border-border rounded-lg p-6 text-center">
        <div className="text-[11px] uppercase tracking-[2px] text-muted-foreground mb-2 font-display">
          Vegas O/U Win Total
        </div>
        {vegasLoading ? (
          <div className="text-[13px] text-muted-foreground mt-3">Checking lines...</div>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mt-1">
              <input
                type="text"
                inputMode="decimal"
                value={vegasTotal}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "" || /^\d{0,2}\.?\d{0,1}$/.test(v)) onVegasTotalChange(v);
                }}
                placeholder="e.g. 7.5"
                className="w-20 py-2.5 px-3 rounded-md border border-border bg-background text-accent text-xl font-bold text-center font-mono-data outline-none focus:border-primary transition-colors duration-200"
              />
            </div>
            {vegasSource && (
              <div className="text-[10px] text-muted-foreground/50 mt-1.5">
                via {vegasSource} • updates daily
              </div>
            )}
            {!vegasSource && vegasTotal === "" && (
              <div className="text-[10px] text-muted-foreground/50 mt-1.5">
                No line available yet — enter manually
              </div>
            )}
          </>
        )}
        {vegasDiff !== null && (
          <div className="mt-3">
            <div
              className={`text-sm font-bold ${
                diffNum > 0 ? "text-positive" : diffNum < 0 ? "text-destructive" : "text-accent"
              }`}
            >
              {diffNum > 0 ? "▲" : diffNum < 0 ? "▼" : "="} Your model:{" "}
              {diffNum > 0 ? "+" : ""}
              {vegasDiff} vs Vegas
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">
              {diffNum > 0.5 ? "Lean OVER" : diffNum < -0.5 ? "Lean UNDER" : "Right around the number"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;
