import { useMemo } from "react";

interface WinDistributionProps {
  winPcts: Record<number, string>;
  totalGames: number;
}

function computeDistribution(probs: number[]): number[] {
  const n = probs.length;
  let dp = new Array(n + 1).fill(0);
  dp[0] = 1;
  for (let i = 0; i < n; i++) {
    const p = probs[i];
    const newDp = new Array(n + 1).fill(0);
    for (let k = 0; k <= i + 1; k++) {
      if (k > 0) newDp[k] += dp[k - 1] * p;
      newDp[k] += dp[k] * (1 - p);
    }
    dp = newDp;
  }
  return dp;
}

const WinDistribution = ({ winPcts, totalGames }: WinDistributionProps) => {
  const distribution = useMemo(() => {
    const probs: number[] = [];
    for (let i = 0; i < totalGames; i++) {
      const val = parseFloat(winPcts[i] || "");
      probs.push(isNaN(val) ? 0 : Math.min(Math.max(val / 100, 0), 1));
    }
    return computeDistribution(probs);
  }, [winPcts, totalGames]);

  const maxProb = Math.max(...distribution, 0.01);
  const filledCount = Object.values(winPcts).filter(
    (v) => v !== "" && v !== undefined && !isNaN(parseFloat(v))
  ).length;
  const expectedWins = distribution.reduce((sum, p, i) => sum + p * i, 0);

  if (filledCount === 0) {
    return (
      <div className="max-w-[900px] mx-auto mt-4 px-4">
        <div className="gradient-card border border-border rounded-lg p-6 text-center">
          <div className="text-[11px] uppercase tracking-[2px] text-muted-foreground mb-3 font-display">
            Win Distribution
          </div>
          <div className="text-sm text-muted-foreground/60">
            Enter win percentages above to see the probability of each win total
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto mt-4 px-4">
      <div className="gradient-card border border-border rounded-lg p-6">
        <div className="text-[11px] uppercase tracking-[2px] text-muted-foreground mb-4 text-center font-display">
          Win Distribution
        </div>

        <div className="flex items-end justify-center gap-[3px] sm:gap-1.5 h-40 sm:h-48 px-1">
          {distribution.slice(0, totalGames + 1).map((prob, winCount) => {
            const heightPct = maxProb > 0 ? (prob / maxProb) * 100 : 0;
            const pctDisplay = (prob * 100).toFixed(1);
            const isMode = prob === maxProb && prob > 0;
            const isBowlEligible = winCount >= 6;
            const isNearExpected = Math.abs(winCount - expectedWins) < 0.6;

            return (
              <div
                key={winCount}
                className="flex flex-col items-center flex-1 max-w-[52px] min-w-[20px]"
              >
                <div
                  className={`text-[9px] sm:text-[10px] font-bold mb-1 font-mono-data transition-opacity duration-200 ${
                    prob >= 0.01
                      ? isMode
                        ? "text-accent"
                        : "text-muted-foreground"
                      : "text-transparent"
                  }`}
                >
                  {prob >= 0.01 ? `${pctDisplay}%` : ""}
                </div>

                <div
                  className={`w-full rounded-t-sm transition-all duration-500 ease-out ${
                    isMode ? "shadow-[0_0_12px_hsl(var(--accent)/0.3)]" : ""
                  }`}
                  style={{
                    height: `${Math.max(heightPct, prob > 0.001 ? 2 : 0)}%`,
                    minHeight: prob > 0.001 ? "2px" : "0px",
                    background: isMode
                      ? "linear-gradient(180deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)"
                      : isBowlEligible
                      ? "linear-gradient(180deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.4) 100%)"
                      : "linear-gradient(180deg, hsl(var(--muted-foreground) / 0.6) 0%, hsl(var(--muted-foreground) / 0.25) 100%)",
                  }}
                />

                <div
                  className={`text-[10px] sm:text-xs font-bold mt-1.5 font-mono-data ${
                    isNearExpected
                      ? "text-accent"
                      : isBowlEligible
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {winCount}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: "linear-gradient(180deg, hsl(var(--accent)) 0%, hsl(var(--primary)) 100%)",
              }}
            />
            <span>Most likely</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: "linear-gradient(180deg, hsl(var(--primary) / 0.8) 0%, hsl(var(--primary) / 0.4) 100%)",
              }}
            />
            <span>Bowl eligible (6+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-sm"
              style={{
                background: "linear-gradient(180deg, hsl(var(--muted-foreground) / 0.6) 0%, hsl(var(--muted-foreground) / 0.25) 100%)",
              }}
            />
            <span>Below .500</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinDistribution;
