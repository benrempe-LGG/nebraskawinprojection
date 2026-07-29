import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { getBallotProgress, getSeasonGameIds } from "@/lib/ballot";
import {
  createCloudEntryPayload,
  restoreCloudEntryPayload,
  type CloudEntryPayloadV2,
} from "@/lib/cloudEntry";
import { getChampionshipGames, loadChampionshipPicks } from "@/lib/championships";
import { LatestSaveQueue, type CloudSaveStatus } from "@/lib/cloudSaveQueue";
import {
  loadPredictionStore,
  type GamePredictionStore,
} from "@/lib/predictionStore";

interface SeasonBallotProps {
  revision: string;
}

type EntryStatus = "draft" | "submitted" | "locked";

function currentEntryPayload(): CloudEntryPayloadV2 {
  const store = loadPredictionStore(localStorage);
  const currentIds = new Set(getSeasonGameIds());
  const predictions = Object.fromEntries(
    Object.entries(store).filter(([id]) => currentIds.has(id))
  ) as GamePredictionStore;
  const championshipPicks = loadChampionshipPicks(
    localStorage,
    getChampionshipGames(predictions)
  );
  return createCloudEntryPayload(predictions, championshipPicks);
}

const SeasonBallot = ({ revision }: SeasonBallotProps) => {
  const { user } = useAuth();
  const [cloudReady, setCloudReady] = useState(false);
  const [entryStatus, setEntryStatus] = useState<EntryStatus>("draft");
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  const [storageRevision, setStorageRevision] = useState(0);
  const [saveState, setSaveState] = useState<CloudSaveStatus>("idle");
  const saveQueue = useRef<LatestSaveQueue<CloudEntryPayloadV2> | null>(null);
  const loadedUserId = useRef<string | null>(null);

  useEffect(() => {
    const refreshProgress = () => setStorageRevision((value) => value + 1);
    window.addEventListener("account-storage-reset", refreshProgress);
    window.addEventListener("cloud-entry-loaded", refreshProgress);
    return () => {
      window.removeEventListener("account-storage-reset", refreshProgress);
      window.removeEventListener("cloud-entry-loaded", refreshProgress);
    };
  }, []);

  const progress = useMemo(
    () => getBallotProgress(loadPredictionStore(localStorage)),
    [revision, storageRevision]
  );
  const percent = progress.totalGames
    ? Math.round((progress.decidedGames / progress.totalGames) * 100)
    : 0;

  useEffect(() => {
    saveQueue.current?.dispose();
    saveQueue.current = null;
    loadedUserId.current = user?.id ?? null;

    if (!user) {
      setCloudReady(false);
      setEntryStatus("draft");
      setSubmittedAt(null);
      setSaveState("idle");
      return;
    }

    let active = true;
    setCloudReady(false);
    setSaveState("loading");

    const queue = new LatestSaveQueue<CloudEntryPayloadV2>(
      async (payload) => {
        if (loadedUserId.current !== user.id) {
          throw new Error("The signed-in account changed before this save started.");
        }
        const { error } = await /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        (supabase as any).rpc("save_entry_draft", {
          payload,
          target_season: 2026,
        });
        if (error) throw new Error(error.message);
      },
      (status, error) => {
        if (!active) return;
        setSaveState(status);
        if (status === "error" && error) {
          toast.error("Cloud save failed: " + error.message);
        }
      }
    );
    saveQueue.current = queue;

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (supabase as any)
      .from("ballots")
      .select("status, submitted_at, draft_payload, locked_payload")
      .eq("user_id", user.id)
      .eq("season", 2026)
      .maybeSingle()
      .then(({
        data,
        error,
      }: {
        data: {
          status: EntryStatus;
          submitted_at: string | null;
          draft_payload: unknown;
          locked_payload: unknown;
        } | null;
        error: { message: string } | null;
      }) => {
        if (!active) return;
        if (error) {
          setSaveState("error");
          toast.error("Could not load your entry: " + error.message);
          return;
        }

        const storedPayload =
          data?.status === "locked" && data.locked_payload
            ? data.locked_payload
            : data?.draft_payload;
        const restored = data
          ? restoreCloudEntryPayload(localStorage, storedPayload)
          : null;

        if (
          restored &&
          (data?.status === "locked" ||
            Object.keys(restored.predictions).length > 0)
        ) {
          queue.seed(JSON.stringify(restored));
          window.dispatchEvent(new CustomEvent("cloud-entry-loaded"));
        } else {
          const payload = currentEntryPayload();
          const serialized = JSON.stringify(payload);
          const hasLocalEntry =
            Object.keys(payload.predictions).length > 0 ||
            Object.keys(payload.championshipPicks).length > 0;
          if (hasLocalEntry) queue.enqueue(serialized, payload);
          else queue.seed(serialized);
        }

        setEntryStatus(data?.status ?? "draft");
        setSubmittedAt(data?.submitted_at ?? null);
        setCloudReady(true);
      });

    return () => {
      active = false;
      queue.dispose();
      if (saveQueue.current === queue) saveQueue.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !cloudReady || entryStatus === "locked") return;
    const payload = currentEntryPayload();
    const serialized = JSON.stringify(payload);

    const timer = window.setTimeout(() => {
      saveQueue.current?.enqueue(serialized, payload);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [revision, user, cloudReady, entryStatus]);

  async function submitEntry() {
    if (!user) return;
    if (!progress.canLock) return;

    const confirmed = window.confirm(
      "Submit your complete 2026 entry? You may continue editing it until the published deadline."
    );
    if (!confirmed) return;

    const payload = currentEntryPayload();
    const serialized = JSON.stringify(payload);
    saveQueue.current?.enqueue(serialized, payload);
    await saveQueue.current?.waitForIdle();

    const { data, error } = await /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (supabase as any).rpc("submit_entry", {
      payload,
      expected_games: progress.totalGames,
      target_season: 2026,
    });

    if (error) {
      setSaveState("error");
      return toast.error(error.message);
    }
    setEntryStatus("submitted");
    setSubmittedAt(data?.submitted_at ?? new Date().toISOString());
    saveQueue.current?.seed(serialized);
    toast.success("Your 2026 entry has been submitted.");
  }

  return (
    <section className="max-w-[900px] mx-auto mt-6 px-4">
      <div className="rounded-xl border border-primary/40 bg-surface-alt p-5 shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent font-display">
              My 2026 entry
            </p>
            <h2 className="mt-1 text-xl font-black text-foreground font-display">
              {progress.decidedGames} of {progress.totalGames} games decided
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {progress.remainingGames > 0
                ? progress.remainingGames + " games still need a probability."
                : progress.undecidedGames > 0
                  ? progress.undecidedGames + " games are at 50% and still need a winner."
                  : entryStatus === "submitted"
                    ? "Entry submitted. Changes continue saving until the deadline."
                    : "Every game has a projected winner. Your entry is ready to submit."}
            </p>
          </div>

          {!user ? (
            <Link
              to="/account"
              className="rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground"
            >
              Sign in to save entry
            </Link>
          ) : (
            <button
              type="button"
              disabled={!progress.canLock || !cloudReady || entryStatus === "locked"}
              onClick={submitEntry}
              className="rounded-lg border border-primary bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
            >
              {entryStatus === "submitted" ? "✓ Entry Submitted" : entryStatus === "locked" ? "🔒 Entry Locked" : "Submit My 2026 Entry"}
            </button>
          )}
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-background">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: percent + "%" }} />
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground font-mono-data">
          <span>{percent}% complete</span>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/review#remaining" className="font-bold text-accent underline underline-offset-2">
              Review {progress.remainingGames} remaining games
            </Link>
            <Link to="/review#fifty" className="font-bold text-accent underline underline-offset-2">
              Review 50% games
            </Link>
          </div>
          <span>
            {!user
              ? "Saved on this device"
              : entryStatus === "locked"
                ? "Locked for the season"
                : !cloudReady || saveState === "loading"
                  ? "Loading cloud entry…"
                  : saveState === "pending"
                    ? "Changes waiting to save…"
                    : saveState === "saving"
                      ? "Saving changes…"
                      : saveState === "error"
                        ? "Save failed — edit a pick to retry"
                        : entryStatus === "submitted"
                          ? "Submitted " + (submittedAt ? new Date(submittedAt).toLocaleDateString() : "") + " · Saved"
                          : "Saved to your account"}
          </span>
        </div>
      </div>
    </section>
  );
};

export default SeasonBallot;
