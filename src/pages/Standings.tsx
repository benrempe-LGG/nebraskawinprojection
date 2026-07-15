import { useMemo } from "react";
import { Link } from "react-router-dom";
import { loadPredictionStore } from "@/lib/predictionStore";
import { computeConferenceStandings } from "@/lib/standings";

const Standings = () => {
  const standings = useMemo(
    () => computeConferenceStandings(loadPredictionStore(localStorage)),
    []
  );

  return (
    <div className="min-h-screen gradient-page pb-20">
      <header className="gradient-header border-b-2 border-primary px-5 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[3px] text-accent font-display">
          2026 Season Projection
        </p>
        <h1 className="mt-2 text-3xl font-black text-primary-foreground font-display">
          Conference Standings
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Every probability above 50% counts as a projected win. A 50% pick remains
          undecided until you choose a side.
        </p>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-7">
          <Link
            to="/"
            className="inline-flex rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-accent"
          >
            ← Back to predictions
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {Object.entries(standings)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([conference, rows]) => {
              const projected = rows.reduce(
                (sum, row) => sum + row.projectedGames,
                0
              ) / 2;
              const total = rows.reduce(
                (sum, row) => sum + row.totalConferenceGames,
                0
              ) / 2;

              return (
                <section
                  key={conference}
                  className="overflow-hidden rounded-xl border border-border bg-surface shadow-lg"
                >
                  <div className="flex items-end justify-between gap-4 border-b border-border bg-primary px-5 py-4">
                    <h2 className="text-xl font-black text-primary-foreground font-display">
                      {conference}
                    </h2>
                    <span className="text-xs font-bold text-primary-foreground/75 font-mono-data">
                      {projected}/{total} games picked
                    </span>
                  </div>

                  <div className="grid grid-cols-[36px_1fr_64px_62px] border-b border-border bg-surface-alt px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <span>#</span>
                    <span>Team</span>
                    <span className="text-center">Record</span>
                    <span className="text-right">Done</span>
                  </div>

                  {rows.map((row, index) => (
                    <div
                      key={row.team}
                      className="grid grid-cols-[36px_1fr_64px_62px] items-center border-b border-border/70 px-4 py-2.5 last:border-0"
                    >
                      <span className="text-xs font-bold text-muted-foreground font-mono-data">
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-bold text-foreground">
                        {row.team}
                      </span>
                      <span className="text-center text-sm font-black text-accent font-mono-data">
                        {row.wins}-{row.losses}
                        {row.undecided ? "-" + row.undecided : ""}
                      </span>
                      <span className="text-right text-xs text-muted-foreground font-mono-data">
                        {row.projectedGames}/{row.totalConferenceGames}
                      </span>
                    </div>
                  ))}
                </section>
              );
            })}
        </div>
      </main>
    </div>
  );
};

export default Standings;
