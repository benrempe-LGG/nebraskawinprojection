import { useMemo } from "react";
import { computeDistribution } from "@/lib/oddsmaker";

interface WinDistributionProps {
  winPcts: Record<number, string>;
  totalGames: number;
}

const MAX_BAR_HEIGHT = 180;

const WinDistribution = ({ winPcts, totalGames }: WinDistributionProps) => {
  const distribution = useMemo(() => {
    const probs: number[] = [];
    for (let i = 0; i < totalGames; i++) {
      const val = parseFloat(winPcts[i] || "");
      probs.push(isNaN(val) ? 0 : Math.min(Math.max(val / 100, 0), 1));
    }
    return computeDistribution(probs);
  }, [winPcts, totalGames]);

  const maxProb = Math.max(...distribution, 0.001);
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

        <div
          className="flex items-end justify-center gap-[3px] sm:gap-2 px-2"
          style={{ height: `${MAX_BAR_HEIGHT + 40}px` }}
        >
          {distribution.slice(0, totalGames + 1).map((prob, winCount) => {
            const barHeight = maxProb > 0 ? Math.round((prob / maxProb) * MAX_BAR_HEIGHT) : 0;
            const pctDisplay = (prob * 100).toFixed(1);
            const isMode = prob === maxProb && prob > 0;
            const isBowlEligible = winCount >= 6;
            const isNearExpected = Math.abs(winCount - expectedWins) < 0.6;

            return (
              <div
                key={winCount}
                className="flex flex-col items-center justify-end flex-1 max-w-[52px] min-w-[18px]"
                style={{ height: `${MAX_BAR_HEIGHT + 40}px` }}
              >
                <div
                  className={`text-[9px] sm:text-[10px] font-bold mb-1 font-mono-data ${
                    prob >= 0.005
                      ? isMode
                        ? "text-accent"
                        : "text-muted-foreground"
                      : "invisible"
                  }`}
                >
                  {prob >= 0.005 ? `${pctDisplay}%` : ""}
                </div>

                <div
                  className="w-full rounded-t transition-all duration-500 ease-out"
                  style={{
                    height: `${Math.max(barHeight, prob > 0.001 ? 3 : 0)}px`,
                    background: isMode
                      ? "linear-gradient(180deg, #ffd54f 0%, #c8102e 100%)"
                      : isBowlEligible
                      ? "linear-gradient(180deg, rgba(200, 16, 46, 0.9) 0%, rgba(200, 16, 46, 0.45) 100%)"
                      : "linear-gradient(180deg, rgba(120, 104, 88, 0.7) 0%, rgba(120, 104, 88, 0.3) 100%)",
                    boxShadow: isMode ? "0 -4px 16px rgba(255, 213, 79, 0.35)" : "none",
                  }}
                />

                <div
                  className={`text-[10px] sm:text-xs font-bold mt-2 font-mono-data ${
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

        <div className="flex flex-wrap justify-center gap-4 mt-5 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(180deg, #ffd54f 0%, #c8102e 100%)" }} />
            <span>Most likely</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(180deg, rgba(200, 16, 46, 0.9) 0%, rgba(200, 16, 46, 0.45) 100%)" }} />
            <span>Bowl eligible (6+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(180deg, rgba(120, 104, 88, 0.7) 0%, rgba(120, 104, 88, 0.3) 100%)" }} />
            <span>Below .500</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinDistribution;
