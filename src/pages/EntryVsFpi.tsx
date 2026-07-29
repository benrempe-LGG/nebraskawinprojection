import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { parseCloudEntryPayload, type CloudEntryPayloadV2 } from "@/lib/cloudEntry";
import { compareEntryToFpi, type EntryFpiComparison } from "@/lib/entryFpiComparison";
import { supabase } from "@/integrations/supabase/client";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; payload: CloudEntryPayloadV2 };

function signedGap(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function winnerSummary(team: string | null): string {
  return team ?? "50/50 neutral";
}

export function EntryVsFpiComparison({
  comparison,
}: {
  comparison: EntryFpiComparison;
}) {
  const complete = comparison.comparedGames === comparison.totalGames;
  const topTeamGaps = comparison.teams.filter((team) => team.comparedGames > 0);

  return (
    <div className="space-y-6">
      {!complete && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-accent">
          This entry is partial. Team gaps use only the games picked in both
          entries; complete the ballot for final standings and playoff comparisons.
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Games compared</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{comparison.comparedGames}/{comparison.totalGames}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Opposite winners</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{comparison.oppositeWinners.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Average probability gap</CardDescription></CardHeader>
          <CardContent><p className="text-3xl font-bold">{comparison.averageProbabilityGap.toFixed(1)} pts</p></CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Your biggest team convictions</CardTitle>
          <CardDescription>
            Expected-win difference versus FPI across the games you have picked
          </CardDescription>
        </CardHeader>
        <CardContent>
          {topTeamGaps.length === 0 ? (
            <p className="text-sm text-muted-foreground">Make picks to generate comparisons.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-sm">
                <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="pb-2">Team</th>
                    <th className="pb-2">Conference</th>
                    <th className="pb-2 text-center">Your record</th>
                    <th className="pb-2 text-center">FPI record</th>
                    <th className="pb-2 text-center">Coverage</th>
                    <th className="pb-2 text-right">Win gap</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {topTeamGaps.map((team) => (
                    <tr key={team.team}>
                      <td className="py-2 font-semibold">{team.team}</td>
                      <td className="py-2 text-muted-foreground">{team.conference}</td>
                      <td className="py-2 text-center">{team.userProjectedRecord}</td>
                      <td className="py-2 text-center">{team.fpiProjectedRecord}</td>
                      <td className="py-2 text-center">{team.comparedGames}/{team.totalGames}</td>
                      <td className={`py-2 text-right font-bold ${team.expectedWinGap >= 0 ? "text-emerald-600" : "text-destructive"}`}>
                        {signedGap(team.expectedWinGap)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Opposite winners</CardTitle>
            <CardDescription>Games where your projected winner differs from FPI</CardDescription>
          </CardHeader>
          <CardContent className="max-h-[620px] overflow-y-auto">
            {comparison.oppositeWinners.length === 0 ? (
              <p className="text-sm text-muted-foreground">No opposite winners yet.</p>
            ) : (
              <div className="divide-y">
                {comparison.oppositeWinners.map((game) => (
                  <div key={game.id} className="py-3">
                    <p className="font-semibold">{game.team} vs {game.opponent}</p>
                    <p className="text-sm text-muted-foreground">
                      You: {winnerSummary(game.userWinner)} ({game.userProbability.toFixed(1)}% {game.team})
                    </p>
                    <p className="text-sm text-muted-foreground">
                      FPI: {winnerSummary(game.fpiWinner)} ({game.fpiProbability.toFixed(1)}% {game.team})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Largest probability disagreements</CardTitle>
            <CardDescription>Top 20 gaps, whether or not the winner changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {comparison.games.slice(0, 20).map((game) => (
                <div key={game.id} className="grid grid-cols-[1fr_auto] gap-4 py-3">
                  <div>
                    <p className="font-semibold">{game.team} vs {game.opponent}</p>
                    <p className="text-sm text-muted-foreground">
                      You {game.userProbability.toFixed(1)}% · FPI {game.fpiProbability.toFixed(1)}%
                    </p>
                  </div>
                  <p className="font-bold">{signedGap(game.probabilityGap)} pts</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Conference races</CardTitle>
          <CardDescription>Your top five versus FPI&apos;s top five</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Object.keys(comparison.fpiStandings).sort().map((conference) => (
            <div key={conference} className="rounded-lg border p-4">
              <h3 className="font-semibold">{conference}</h3>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">You</p>
                  {comparison.userStandings[conference].slice(0, 5).map((row, index) => (
                    <p key={row.team} className="truncate">{index + 1}. {row.team} <span className="text-muted-foreground">{row.wins}-{row.losses}</span></p>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">FPI</p>
                  {comparison.fpiStandings[conference].slice(0, 5).map((row, index) => (
                    <p key={row.team} className="truncate">{index + 1}. {row.team} <span className="text-muted-foreground">{row.wins}-{row.losses}</span></p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Playoff-field differences</CardTitle>
          <CardDescription>Named teams only; both views reserve the G6 champion position</CardDescription>
        </CardHeader>
        <CardContent>
          {!comparison.userPlayoffComplete ? (
            <p className="text-sm text-muted-foreground">
              Complete the regular-season entry and choose all four conference
              champions to compare playoff fields.
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <h3 className="font-semibold">Only in yours</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {comparison.userOnlyPlayoffTeams.join(", ") || "None"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Only in FPI</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {comparison.fpiOnlyPlayoffTeams.join(", ") || "None"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Your seeded field</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {comparison.userPlayoff.map((team) => `${team.seed}. ${team.team}`).join(" · ")}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EntryVsFpi() {
  const { user, loading: authLoading } = useAuth();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadState({ status: "loading" });
      return;
    }

    let active = true;
    setLoadState({ status: "loading" });
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
        data: { status: string; draft_payload: unknown; locked_payload: unknown } | null;
        error: { message: string } | null;
      }) => {
        if (!active) return;
        if (error) {
          setLoadState({ status: "error", message: error.message });
          return;
        }
        const source =
          data?.status === "locked" && data.locked_payload
            ? data.locked_payload
            : data?.draft_payload;
        setLoadState({
          status: "ready",
          payload: parseCloudEntryPayload(source),
        });
      });

    return () => {
      active = false;
    };
  }, [authLoading, user]);

  const comparison = useMemo(
    () =>
      loadState.status === "ready"
        ? compareEntryToFpi(
            loadState.payload.predictions,
            loadState.payload.championshipPicks,
          )
        : null,
    [loadState],
  );

  return (
    <main className="container max-w-7xl py-12">
      <div className="flex flex-wrap gap-3 text-sm">
        <Link to="/entry" className="text-muted-foreground hover:text-foreground">← My Entry</Link>
        <Link to="/models/fpi" className="text-muted-foreground hover:text-foreground">Public FPI model</Link>
      </div>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">You vs. FPI</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          See where your official 2026 entry agrees with the public benchmark—and
          where your football convictions separate you from the model.
        </p>
      </div>

      <div className="mt-8">
        {authLoading ? (
          <p className="text-muted-foreground">Checking your account…</p>
        ) : !user ? (
          <Card>
            <CardHeader>
              <CardTitle>Sign in to compare your official entry</CardTitle>
              <CardDescription>Your private picks are visible only to your account.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/account?next=%2Fcompare%2Ffpi" className="inline-flex rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">
                Sign in
              </Link>
            </CardContent>
          </Card>
        ) : loadState.status === "loading" ? (
          <p className="text-muted-foreground">Loading your cloud entry…</p>
        ) : loadState.status === "error" ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            Could not load your entry: {loadState.message}
          </div>
        ) : comparison ? (
          <EntryVsFpiComparison comparison={comparison} />
        ) : null}
      </div>
    </main>
  );
}
