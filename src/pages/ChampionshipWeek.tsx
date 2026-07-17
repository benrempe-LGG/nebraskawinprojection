import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { loadPredictionStore } from "@/lib/predictionStore";
import {
  championshipPicksComplete,
  getChampionshipGames,
  loadChampionshipPicks,
  saveChampionshipPick,
  type ChampionshipPicks,
  type P4Conference,
} from "@/lib/championships";

const ChampionshipWeek = () => {
  const predictions = useMemo(() => loadPredictionStore(localStorage), []);
  const games = useMemo(() => getChampionshipGames(predictions), [predictions]);
  const [picks, setPicks] = useState<ChampionshipPicks>(() =>
    loadChampionshipPicks(localStorage, games)
  );
  const complete = championshipPicksComplete(games, picks);

  function pickWinner(conference: P4Conference, winner: string) {
    setPicks(saveChampionshipPick(localStorage, games, conference, winner));
  }

  return (
    <div className="min-h-screen gradient-page pb-20">
      <header className="gradient-header border-b-2 border-primary px-5 py-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[3px] text-accent font-display">
          The final Saturday
        </p>
        <h1 className="mt-2 text-3xl font-black text-primary-foreground font-display">
          2026 Championship Week
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          The top two teams in each projected conference table advance. Pick all
          four champions to unlock the final playoff outlook.
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-7 flex flex-wrap gap-3">
          <Link to="/standings" className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground hover:border-primary">
            ← Conference standings
          </Link>
          <Link to="/" className="rounded-lg border border-border bg-muted px-4 py-2 text-sm font-bold text-foreground hover:border-primary">
            Predictions
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {games.map((game) => {
            const selected = picks[game.conference];
            return (
              <section key={game.conference} className="rounded-xl border border-border bg-surface p-5 shadow-lg">
                <p className="text-xs font-black uppercase tracking-[2px] text-accent">
                  {game.conference} Championship
                </p>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-stretch gap-3">
                  {[game.firstTeam, game.secondTeam].map((team, index) => (
                    <div className="contents" key={team}>
                      {index === 1 && (
                        <div className="flex items-center text-xs font-black text-muted-foreground">VS</div>
                      )}
                      <button
                        type="button"
                        onClick={() => pickWinner(game.conference, team)}
                        className={
                          "rounded-lg border px-3 py-5 text-center font-black transition-colors " +
                          (selected === team
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface-alt text-foreground hover:border-primary")
                        }
                      >
                        {selected === team && <span className="mb-1 block text-xs">✓ CHAMPION</span>}
                        {team}
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <section className="mt-7 rounded-xl border border-primary/40 bg-surface-alt p-5 text-center">
          <h2 className="text-xl font-black text-foreground">
            {complete ? "Championship Week complete" : Object.keys(picks).length + " of 4 champions selected"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {complete
              ? "Your champions and championship-game records are ready for the playoff model."
              : "Select a winner in every conference championship game."}
          </p>
          <Link
            to="/playoff"
            aria-disabled={!complete}
            className={
              "mt-4 inline-flex rounded-lg px-6 py-3 text-sm font-black " +
              (complete
                ? "bg-primary text-primary-foreground"
                : "pointer-events-none bg-muted text-muted-foreground opacity-50")
            }
          >
            Build playoff field →
          </Link>
        </section>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Participants follow projected conference record, then conference win
          percentage, wins, losses, and team name when records remain tied.
        </p>
      </main>
    </div>
  );
};

export default ChampionshipWeek;
