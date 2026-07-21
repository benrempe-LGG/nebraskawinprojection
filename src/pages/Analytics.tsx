import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ANALYTICS_DATA, ANALYTICS_CONFERENCES, YEARS, YEAR_LABELS, type TeamAnalytics } from "@/lib/analyticsData";

const CONF_COLORS: Record<string, string> = {
  ACC: "hsl(210 80% 60%)",
  B1G: "hsl(350 89% 44%)",
  B12: "hsl(35 90% 55%)",
  SEC: "hsl(142 72% 37%)",
};

function getDeltaColor(delta: number): string {
  // Positive delta = overperformer (green), negative = underperformer (red)
  if (delta >= 40) return "hsl(142 72% 32%)";
  if (delta >= 25) return "hsl(142 60% 28%)";
  if (delta >= 15) return "hsl(142 50% 24%)";
  if (delta >= 5) return "hsl(100 40% 22%)";
  if (delta >= -5) return "hsl(45 40% 22%)";
  if (delta >= -15) return "hsl(20 50% 22%)";
  if (delta >= -25) return "hsl(5 55% 24%)";
  if (delta >= -40) return "hsl(0 60% 26%)";
  return "hsl(0 70% 22%)";
}

function getDeltaTextColor(delta: number): string {
  if (Math.abs(delta) < 5) return "hsl(45 30% 60%)";
  if (delta > 0) return "hsl(142 60% 70%)";
  return "hsl(0 60% 70%)";
}

const Analytics = () => {
  const [confFilter, setConfFilter] = useState<string>("All");

  const filteredTeams = useMemo(() => {
    const teams = confFilter === "All"
      ? [...ANALYTICS_DATA]
      : ANALYTICS_DATA.filter((t) => t.conf === confFilter);
    // Sort by delta_avg descending (biggest overachievers first = most positive delta)
    return teams.sort((a, b) => b.delta_avg - a.delta_avg);
  }, [confFilter]);

  return (
    <main className="gradient-page min-h-screen pb-16">
      {/* Header */}
      <div className="gradient-header py-6 sm:py-8 border-b border-border">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-display tracking-wider uppercase"
            >
              ← Oddsmaker
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display glow-header text-foreground">
            Program Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
            Calibrate your Oddsmaker predictions. Understand which programs convert talent into wins — and which consistently don't.
          </p>
        </div>
      </div>

      {/* Section 1: Heat Map */}
      <div className="max-w-[1100px] mx-auto mt-6 px-4">
        <div className="gradient-card border border-border rounded-lg p-4 sm:p-6">
          <div className="text-[11px] uppercase tracking-[2px] text-muted-foreground mb-2 font-display text-center">
            Talent vs. Performance Heat Map — 2016–2025
          </div>
          <p className="text-xs text-muted-foreground/70 text-center mb-5 max-w-2xl mx-auto leading-relaxed">
            Green = program outperforming its recruiting. Red = talent not converting to wins. Watch for inflection points — they mark coaching changes, NIL era impact, and transfer portal shifts.
          </p>

          {/* Conference filter */}
          <div className="flex justify-center gap-2 mb-5">
            {ANALYTICS_CONFERENCES.map((c) => (
              <button
                key={c}
                onClick={() => setConfFilter(c)}
                className={`px-3 py-1.5 rounded text-xs font-bold font-display tracking-wide border transition-colors ${
                  confFilter === c
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Heat map table */}
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground font-display py-2 px-2 sticky left-0 bg-card z-10 min-w-[120px]">
                    Team
                  </th>
                  <th className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-display py-2 px-1 w-10">
                    Conf
                  </th>
                  {YEAR_LABELS.map((y) => (
                    <th
                      key={y}
                      className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-display py-2 px-0.5 w-[52px]"
                    >
                      {y.slice(2)}
                    </th>
                  ))}
                  <th className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-display py-2 px-1 w-14">
                    Avg Δ
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team) => (
                  <tr key={team.team} className="border-t border-border/30 hover:bg-muted/30 transition-colors">
                    <td className="text-xs font-bold text-foreground py-1.5 px-2 sticky left-0 bg-card z-10 font-display whitespace-nowrap">
                      {team.team}
                    </td>
                    <td className="text-center py-1.5 px-1">
                      <span
                        className="text-[9px] font-bold font-mono-data px-1 rounded"
                        style={{ color: CONF_COLORS[team.conf] || "hsl(var(--muted-foreground))" }}
                      >
                        {team.conf}
                      </span>
                    </td>
                    {YEARS.map((y) => {
                      const delta = team.delta[y];
                      return (
                        <td key={y} className="text-center py-1.5 px-0.5">
                          <div
                            className="rounded-sm mx-auto flex items-center justify-center h-6 w-full max-w-[44px]"
                            style={{ backgroundColor: getDeltaColor(delta) }}
                            title={`${team.team} '${y}: SP+ #${team.sp[y]}, TCC #${team.tcc[y]}, Δ${delta > 0 ? "+" : ""}${delta}`}
                          >
                            <span
                              className="text-[9px] font-bold font-mono-data"
                              style={{ color: getDeltaTextColor(delta) }}
                            >
                              {delta > 0 ? "+" : ""}{delta}
                            </span>
                          </div>
                        </td>
                      );
                    })}
                    <td className="text-center py-1.5 px-1">
                      <span
                        className={`text-[10px] font-bold font-mono-data ${
                          team.delta_avg > 5
                            ? "text-[hsl(142_60%_60%)]"
                            : team.delta_avg < -5
                            ? "text-[hsl(0_60%_60%)]"
                            : "text-muted-foreground"
                        }`}
                      >
                        {team.delta_avg > 0 ? "+" : ""}{team.delta_avg.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: getDeltaColor(30) }} />
              <span>Overperformer</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: getDeltaColor(0) }} />
              <span>Neutral</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: getDeltaColor(-30) }} />
              <span>Underperformer</span>
            </div>
          </div>

          {/* Data definitions */}
          <div className="mt-4 bg-background/50 border border-border/50 rounded p-3 text-[11px] text-muted-foreground/60 leading-relaxed">
            <strong className="text-muted-foreground/80">Reading the delta:</strong> Delta = TCC rank − SP+ rank. 
            Positive = performing better than talent predicts (overachiever). 
            Negative = talent not converting to wins (underachiever). 
            SP+ and TCC ranks are national rankings where 1 = best.
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[1100px] mx-auto mt-8 px-4 text-center text-[11px] text-muted-foreground/50">
        SP+ data via Bill Connelly. Talent Composite via 247Sports. 2016–2025 seasons.
      </div>
    </main>
  );
};

export default Analytics;
