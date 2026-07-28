import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ALL_TEAMS } from "@/lib/oddsmaker";
import {
  buildFpiModelEntry,
  expectedFpiWins,
  FPI_MODEL_METADATA,
  getFpiTeamRating,
  projectFpiTeam,
} from "@/lib/fpiModel";

const teamNames = Object.keys(ALL_TEAMS).sort((a, b) => a.localeCompare(b));
const entryGameCount = Object.keys(buildFpiModelEntry()).length;

function locationLabel(location: "HOME" | "AWAY" | "NEUTRAL") {
  if (location === "HOME") return "vs";
  if (location === "AWAY") return "at";
  return "vs";
}

export default function FpiModel() {
  const [team, setTeam] = useState("Nebraska");
  const schedule = ALL_TEAMS[team]?.schedule ?? [];
  const projections = useMemo(() => projectFpiTeam(team), [team]);
  const expectedWins = useMemo(() => expectedFpiWins(team), [team]);
  const rating = getFpiTeamRating(team);
  const fallbackCount = projections.filter((game) => !game.opponentRated).length;

  return (
    <main className="container max-w-5xl py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to predictor
      </Link>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>2026 FPI-based model entry</CardTitle>
            <CardDescription>
              A public, read-only {entryGameCount}-game benchmark generated from
              ESPN&apos;s published team-strength ratings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Link
              to="/models/fpi/season"
              className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              View projected standings and playoff
            </Link>
            <div className="grid gap-4 sm:grid-cols-[minmax(220px,1fr)_auto_auto] sm:items-end">
              <label className="space-y-2 text-sm font-medium">
                Team
                <select
                  aria-label="Team"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                >
                  {teamNames.map((name) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </label>
              <div>
                <p className="text-xs text-muted-foreground">FPI rating</p>
                <p className="text-3xl font-bold">{rating.rating.toFixed(1)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Expected record</p>
                <p className="text-3xl font-bold">
                  {expectedWins.toFixed(1)}–{(schedule.length - expectedWins).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
              <p>
                Each probability starts with the teams&apos; FPI rating difference,
                adds {FPI_MODEL_METADATA.homeFieldPoints.toFixed(1)} points for home field,
                and converts the expected margin with a transparent logistic curve.
                This is an independent FPI-based model, not an official ESPN matchup prediction.
              </p>
              {fallbackCount > 0 && (
                <p className="mt-2">
                  {fallbackCount} {fallbackCount === 1 ? "opponent is" : "opponents are"} not
                  listed in the published FPI table and {fallbackCount === 1 ? "uses" : "use"} the documented
                  {` ${FPI_MODEL_METADATA.unratedOpponentRating.toFixed(1)} `}fallback rating.
                </p>
              )}
              <a
                className="mt-3 inline-flex items-center gap-1 font-medium text-primary hover:underline"
                href={FPI_MODEL_METADATA.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                ESPN source, updated {FPI_MODEL_METADATA.sourceUpdated}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{team} game probabilities</CardTitle>
            <CardDescription>
              The favorite is whichever side is above 50%. Neutral-site games receive no home-field adjustment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y rounded-lg border">
              {schedule.map((game, index) => {
                const projection = projections[index];
                return (
                  <div
                    key={`${game.date}-${game.opponent}`}
                    className="grid gap-3 p-4 sm:grid-cols-[90px_minmax(180px,1fr)_100px_110px] sm:items-center"
                  >
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Week {game.week}
                      </p>
                      <p className="text-sm font-medium">{game.date}</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {locationLabel(game.loc)} {game.opponent}
                        {game.loc === "NEUTRAL" ? " (neutral)" : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Opponent FPI: {projection.opponentRating.toFixed(1)}
                        {!projection.opponentRated ? " (fallback)" : ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expected margin</p>
                      <p className="font-semibold">
                        {projection.expectedMargin > 0 ? "+" : ""}
                        {projection.expectedMargin.toFixed(1)}
                      </p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs text-muted-foreground">{team} win</p>
                      <p className="text-2xl font-bold">{projection.winProbability.toFixed(1)}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground">
          ESPN and FPI are trademarks of their respective owners. This independent
          benchmark is provided for comparison and is not affiliated with or endorsed by ESPN.
        </p>
      </div>
    </main>
  );
}
