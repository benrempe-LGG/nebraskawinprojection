import { useMemo } from "react";
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
    const fiftyPercent = games
      .map(({ id, team, game }) => {
        const value = getTeamGamePrediction(predictions, team, game);
        return {
          id,
          team,
          game,
          value,
          winner: value === "50" ? getProjectedWinner(team, game, value) : null,
        };
      })
      .filter((item) => item.value === "50")
      .sort((a, b) => a.team.localeCompare(b.team));

    return {
      fiftyPercent,
      unpicked: games.filter(
        ({ team, game }) =>
          getTeamGamePrediction(predictions, team, game) === ""
      ).length,
    };
  }, []);

  return (
    <div className="min-h-screen gradient-page pb-20">
      <header className="gradient-header border-b-2 border-primary px-5 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[3px] text-accent font-display">
          Full-season quality check
        </p>
        <h1 className="mt-2 text-3xl font-black text-primary-foreground font-display">
          Review 50% Games
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Home teams are treated as the default favorite at 50%. Neutral-site
          games still require you to choose a side.
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
          <div className="text-sm text-muted-foreground">
            <strong className="text-accent">{review.fiftyPercent.length}</strong>{" "}
            at 50% ·{" "}
            <strong className="text-accent">{review.unpicked}</strong> unpicked
          </div>
        </div>

        {review.fiftyPercent.length === 0 ? (
          <div className="rounded-xl border border-positive/40 bg-positive/10 p-8 text-center">
            <h2 className="text-xl font-black text-foreground">
              No 50% games to review
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every entered matchup has a probability above or below 50%.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
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
                    {winner ? winner + " defaults as favorite" : "Choose a winner"}
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
      </main>
    </div>
  );
};

export default PickReview;
