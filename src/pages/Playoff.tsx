import { useMemo } from "react";
import { Link } from "react-router-dom";
import { loadPredictionStore } from "@/lib/predictionStore";
import { projectPlayoffField } from "@/lib/playoff";

const Playoff = () => {
  const outlook = useMemo(
    () => projectPlayoffField(loadPredictionStore(localStorage)),
    []
  );
  const bySeed = new Map(outlook.teams.map((team) => [team.seed, team]));
  const label = (seed: number) => {
    if (seed === outlook.groupOfSixSeed) return "Highest-ranked G6 team";
    return bySeed.get(seed)?.team || "Projection incomplete";
  };

  return (
    <div className="min-h-screen gradient-page pb-20">
      <header className="gradient-header border-b-2 border-primary px-5 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[3px] text-accent font-display">
          Record-based committee proxy
        </p>
        <h1 className="mt-2 text-3xl font-black text-primary-foreground font-display">
          2026 Playoff Outlook
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Four projected P4 champions, seven P4 at-large teams, and one reserved
          Group-of-6 position form this 12-team outlook.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-7 flex flex-wrap gap-3">
          <Link
            to="/"
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground hover:border-primary"
          >
            ← Predictions
          </Link>
          <Link
            to="/standings"
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground hover:border-primary"
          >
            Conference standings
          </Link>
        </div>

        {!outlook.complete && (
          <div className="mb-6 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
            This is a live outlook from the games entered so far. Complete and
            lock the full-season ballot for a final projection.
          </div>
        )}

        <section className="rounded-xl border border-border bg-surface p-5 shadow-lg">
          <h2 className="text-xl font-black text-foreground font-display">
            First-round byes
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((seed) => (
              <div
                key={seed}
                className="rounded-lg border border-primary/30 bg-primary/10 p-4"
              >
                <div className="text-xs font-black text-accent">SEED {seed}</div>
                <div className="mt-1 font-black text-foreground">
                  {label(seed)}
                </div>
                {bySeed.get(seed) && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    {bySeed.get(seed)!.wins}-{bySeed.get(seed)!.losses} ·{" "}
                    {bySeed.get(seed)!.qualification}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface p-5 shadow-lg">
          <h2 className="text-xl font-black text-foreground font-display">
            Campus first round
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {[
              [5, 12],
              [6, 11],
              [7, 10],
              [8, 9],
            ].map(([home, away]) => (
              <div
                key={home}
                className="rounded-lg border border-border bg-surface-alt p-4"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hosted by seed {home}
                </div>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <span className="font-bold text-foreground">
                    #{away} {label(away)}
                  </span>
                  <span className="text-xs font-black text-accent">AT</span>
                  <span className="text-right font-bold text-foreground">
                    #{home} {label(home)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-surface-alt p-5 text-sm leading-relaxed text-muted-foreground">
          <strong className="text-foreground">How this projection works:</strong>{" "}
          teams are ranked by projected winning percentage, wins, then losses.
          Conference standings leaders are treated as projected P4 champions.
          Actual selection and seeding belong to the CFP committee and use more
          information than predicted records. The app does not yet contain G6
          schedules, so seed 12 is reserved rather than invented.{" "}
          <a
            href="https://collegefootballplayoff.com/sports/2024/5/29/12-team-format.aspx"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-accent underline"
          >
            Official CFP format
          </a>
        </section>
      </main>
    </div>
  );
};

export default Playoff;
