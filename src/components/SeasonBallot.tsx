import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  getBallotProgress,
  loadLockedBallots,
  lockCurrentBallot,
} from "@/lib/ballot";
import { loadPredictionStore } from "@/lib/predictionStore";

interface SeasonBallotProps {
  revision: string;
}

const SeasonBallot = ({ revision }: SeasonBallotProps) => {
  const progress = useMemo(
    () => getBallotProgress(loadPredictionStore(localStorage)),
    [revision]
  );
  const [lockedCount, setLockedCount] = useState(
    () => loadLockedBallots(localStorage).length
  );
  const percent =
    progress.totalGames > 0
      ? Math.round((progress.decidedGames / progress.totalGames) * 100)
      : 0;

  const handleLock = () => {
    if (!progress.canLock) return;

    const confirmed = window.confirm(
      "Lock this complete 2026 prediction? This creates a permanent snapshot. You can keep editing your current draft afterward."
    );
    if (!confirmed) return;

    try {
      const ballot = lockCurrentBallot(
        localStorage,
        loadPredictionStore(localStorage)
      );
      setLockedCount((count) => count + 1);
      toast.success(
        "2026 prediction locked at " +
          new Date(ballot.lockedAt).toLocaleString()
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to lock prediction"
      );
    }
  };

  return (
    <section className="max-w-[900px] mx-auto mt-6 px-4">
      <div className="rounded-xl border border-primary/40 bg-surface-alt p-5 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent font-display">
              Full-season ballot
            </p>
            <h2 className="mt-1 text-xl font-black text-foreground font-display">
              {progress.decidedGames} of {progress.totalGames} games decided
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progress.remainingGames > 0
                ? progress.remainingGames + " games still need a probability."
                : progress.undecidedGames > 0
                  ? progress.undecidedGames +
                    " games are at 50% and still need a winner."
                  : "Every game has a projected winner. Your ballot is ready."}
            </p>
          </div>

          <button
            type="button"
            disabled={!progress.canLock}
            onClick={handleLock}
            className="rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
          >
            🔒 Lock 2026 Prediction
          </button>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: percent + "%" }}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono-data">
          <span>{percent}% complete</span>
          <Link
            to="/review"
            className="font-bold text-accent underline underline-offset-2"
          >
            Review 50% games
          </Link>
          <span>
            {lockedCount
              ? lockedCount + " locked snapshot" + (lockedCount === 1 ? "" : "s")
              : "No locked snapshots yet"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default SeasonBallot;
