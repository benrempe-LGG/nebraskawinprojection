import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { getSeasonGames } from "@/lib/ballot";
import { getProjectedWinner } from "@/lib/oddsmaker";
import {
  getTeamGamePrediction,
  loadPredictionStore,
} from "@/lib/predictionStore";

const PickReview = () => {
  const review = useMemo(() => {
    const predictions = loadPredictionStore(localStorage);
    const games = getSeasonGames();
    const evaluated = games.map(({ id, team, game }) => {
      const value = getTeamGamePrediction(predictions, team, game);
      return {
        id,
        team,
        game,
        value,
        winner: value === "50" ? getProjectedWinner(team, game, value) : null,
      };
    });

    return {
      fiftyPercent: evaluated
        .filter((item) => item.value === "50")
        .sort((a, b) => a.team.localeCompare(b.team)),
      unpicked: evaluated
        .filter((item) => item.value === "")
        .sort((a, b) => a.team.localeCompare(b.team)),
    };
  }, []);

  return (
    <div className="min-h-screen gradient-page pb-20">
      <header className="gradient-header border-b-2 border-primary px-5 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[3px] text-accent font-display">
          Full-season quality check
        </p>
        <h1 className="mt-2 text-3xl font-black text-primary-foreground font-display">
          Review Season Picks
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Find every missing prediction and inspect games left at 50%.
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            to="/"
            className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground hover:border-primary"
          >
            ← Predictions
          </Link>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <a href="#remaining" className="font-bold text-accent underline">
              {review.unpicked.length} remaining
            </a>
            <a href="#fifty" className="font-bold text-accent underline">
              {review.fiftyPercent.length} at 50%
            </a>
          </div>
        </div>

        <section id="remaining" className="scroll-mt-24">
          <h2 className="text-xl font-black text-foreground font-display">
            Remaining games
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These matchups do not have a probability yet.
          </p>

          {review.unpicked.length === 0 ? (
            <div className="mt-4 rounded-xl border border-positive/40 bg-positive/10 p-6 text-center">
              <strong className="text-foreground">Every game has a prediction.</strong>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
              {review.unpicked.map(({ id, team, game }) => (
                <div
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 last:border-0"
                >
                  <div>
                    <div className="font-black text-foreground">
                      {team} vs. {game.opponent}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {game.date} · {game.venue}
                    </div>
                  </div>
                  <Link
                    to={"/?t=" + encodeURIComponent(team)}
                    className="rounded-md border border-primary px-3 py-1.5 text-xs font-black text-accent hover:bg-primary hover:text-primary-foreground"
                  >
                    Add prediction
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section id="fifty" className="mt-10 scroll-mt-24">
          <h2 className="text-xl font-black text-foreground font-display">
            50% games
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Home teams default as the point-spread favorite. Neutral-site games
            still need you to choose a side.
          </p>

          {review.fiftyPercent.length === 0 ? (
            <div className="mt-4 rounded-xl border border-positive/40 bg-positive/10 p-6 text-center">
              <strong className="text-foreground">No 50% games to review.</strong>
            </div>
          ) : (
            <div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface">
              {review.fiftyPercent.map(({ id, team, game, winner }) => (
                <div
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4 last:border-0"
                >
                  <div>
                    <div className="font-black text-foreground">
                      {team} vs. {game.opponent}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {game.date} · {game.venue}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        winner
                          ? "text-sm font-bold text-positive"
                          : "text-sm font-bold text-accent"
                      }
                    >
                      {winner
                        ? winner + " defaults as favorite"
                        : "Choose a winner"}
                    </span>
                    <Link
                      to={"/?t=" + encodeURIComponent(team)}
                      className="rounded-md border border-primary px-3 py-1.5 text-xs font-black text-accent hover:bg-primary hover:text-primary-foreground"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default PickReview;
