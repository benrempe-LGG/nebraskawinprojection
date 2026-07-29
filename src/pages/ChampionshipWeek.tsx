import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  createCloudEntryPayload,
  restoreCloudEntryPayload,
} from "@/lib/cloudEntry";
import { loadPredictionStore, type GamePredictionStore } from "@/lib/predictionStore";
import {
  championshipPicksComplete,
  getChampionshipGames,
  loadChampionshipPicks,
  saveChampionshipPick,
  type ChampionshipPicks,
  type P4Conference,
} from "@/lib/championships";

type EntryStatus = "draft" | "submitted" | "locked";

const ChampionshipWeek = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<GamePredictionStore>(() =>
    loadPredictionStore(localStorage)
  );
  const games = useMemo(() => getChampionshipGames(predictions), [predictions]);
  const [picks, setPicks] = useState<ChampionshipPicks>(() =>
    loadChampionshipPicks(localStorage, games)
  );
  const [entryStatus, setEntryStatus] = useState<EntryStatus>("draft");
  const [cloudReady, setCloudReady] = useState(!user);
  const complete = championshipPicksComplete(games, picks);

  useEffect(() => {
    setPicks(loadChampionshipPicks(localStorage, games));
  }, [games]);

  useEffect(() => {
    if (!user) {
      setCloudReady(true);
      setEntryStatus("draft");
      return;
    }

    let active = true;
    setCloudReady(false);

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (supabase as any)
      .from("ballots")
      .select("status, draft_payload, locked_payload")
      .eq("user_id", user.id)
      .eq("season", 2026)
      .maybeSingle()
      .then(({
        data,
        error,
      }: {
        data: {
          status: EntryStatus;
          draft_payload: unknown;
          locked_payload: unknown;
        } | null;
        error: { message: string } | null;
      }) => {
        if (!active) return;
        if (error) {
          toast.error("Could not load Championship Week: " + error.message);
          setCloudReady(true);
          return;
        }

        if (data) {
          const storedPayload =
            data.status === "locked" && data.locked_payload
              ? data.locked_payload
              : data.draft_payload;
          const restored = restoreCloudEntryPayload(
            localStorage,
            storedPayload
          );
          setPredictions(restored.predictions);
          setPicks(restored.championshipPicks);
          setEntryStatus(data.status);
        }
        setCloudReady(true);
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function pickWinner(conference: P4Conference, winner: string) {
    if (entryStatus === "locked") {
      toast.error("This entry is locked for the season.");
      return;
    }

    const next = saveChampionshipPick(
      localStorage,
      games,
      conference,
      winner
    );
    setPicks(next);

    if (!user) return;
    const payload = createCloudEntryPayload(predictions, next);
    const { error } = await /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (supabase as any).rpc("save_entry_draft", {
      payload,
      target_season: 2026,
    });
    if (error) toast.error("Championship pick did not save: " + error.message);
  }

  const picksDisabled =
    entryStatus === "locked" || (!!user && !cloudReady);

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

        {user && (
          <div className="mb-5 rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-muted-foreground">
            {!cloudReady
              ? "Loading Championship Week from your account…"
              : entryStatus === "locked"
                ? "These championship picks are part of your locked 2026 entry."
                : "Championship picks save automatically to your account."}
          </div>
        )}

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
                        disabled={picksDisabled}
                        onClick={() => pickWinner(game.conference, team)}
                        className={
                          "rounded-lg border px-3 py-5 text-center font-black transition-colors disabled:cursor-not-allowed disabled:opacity-60 " +
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
