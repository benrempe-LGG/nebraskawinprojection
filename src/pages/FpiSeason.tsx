import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FPI_MODEL_METADATA } from "@/lib/fpiModel";
import { buildFpiSeasonProjection } from "@/lib/fpiSeason";

const projection = buildFpiSeasonProjection();

export default function FpiSeason() {
  const bySeed = new Map(
    projection.playoff.teams.map((team) => [team.seed, team]),
  );
  const seedName = (seed: number) =>
    seed === projection.playoff.groupOfSixSeed
      ? "Highest-ranked G6 champion"
      : bySeed.get(seed)?.team ?? "TBD";

  return (
    <main className="container max-w-7xl py-12">
      <div className="flex flex-wrap gap-3">
        <Link to="/models/fpi" className="text-sm text-muted-foreground hover:text-foreground">
          ← FPI game probabilities
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          Predictor
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>2026 FPI end-of-year projection</CardTitle>
            <CardDescription>
              The higher-probability team becomes the projected winner; an exact
              50/50 regular-season game goes to the home team. Conference
              championships use the same model at a neutral site.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            This is a deterministic scenario derived from the public FPI-based
            benchmark—not an official ESPN or CFP forecast. Conference ties use
            expected conference wins, then expected overall wins, after projected
            conference record.
          </CardContent>
        </Card>

        <section className="grid gap-6 xl:grid-cols-2">
          {Object.entries(projection.standings)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([conference, rows]) => (
              <Card key={conference}>
                <CardHeader>
                  <CardTitle>{conference}</CardTitle>
                  <CardDescription>Projected conference and overall records</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[460px] text-sm">
                      <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                        <tr>
                          <th className="pb-2 pr-2">#</th>
                          <th className="pb-2">Team</th>
                          <th className="pb-2 text-center">Conf</th>
                          <th className="pb-2 text-center">Overall</th>
                          <th className="pb-2 text-right">Exp. wins</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {rows.map((row, index) => (
                          <tr key={row.team}>
                            <td className="py-2 pr-2 text-muted-foreground">{index + 1}</td>
                            <td className="py-2 font-medium">{row.team}</td>
                            <td className="py-2 text-center">{row.wins}-{row.losses}</td>
                            <td className="py-2 text-center">{row.overallWins}-{row.overallLosses}</td>
                            <td className="py-2 text-right">{row.expectedWins.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Projected Championship Week</CardTitle>
            <CardDescription>Neutral-site FPI-based championship projections</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {projection.championships.map((game) => {
              const firstTeamProbability = game.projection.winProbability;
              return (
                <div key={game.conference} className="rounded-lg border p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {game.conference}
                  </p>
                  <p className="mt-2 font-semibold">
                    {game.firstTeam} <span className="text-muted-foreground">{firstTeamProbability.toFixed(1)}%</span>
                  </p>
                  <p className="font-semibold">
                    {game.secondTeam} <span className="text-muted-foreground">{(100 - firstTeamProbability).toFixed(1)}%</span>
                  </p>
                  <p className="mt-3 text-sm">
                    Champion: <strong>{game.winner}</strong>
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projected 12-team playoff</CardTitle>
            <CardDescription>
              Four projected P4 champions, seven at-large selections, and one
              reserved G6 champion position
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold">First-round byes</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((seed) => {
                  const team = bySeed.get(seed);
                  return (
                    <div key={seed} className="rounded-lg border bg-muted/40 p-4">
                      <p className="text-xs text-muted-foreground">SEED {seed}</p>
                      <p className="font-semibold">{seedName(seed)}</p>
                      {team && <p className="text-xs text-muted-foreground">{team.wins}-{team.losses} · {team.qualification}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-semibold">Campus first round</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {[[5, 12], [6, 11], [7, 10], [8, 9]].map(([home, away]) => (
                  <div key={home} className="rounded-lg border p-4 text-center">
                    <span className="font-semibold">#{away} {seedName(away)}</span>
                    <span className="mx-3 text-xs text-muted-foreground">AT</span>
                    <span className="font-semibold">#{home} {seedName(home)}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              The playoff order uses the app&apos;s documented record-based committee
              proxy. The app does not model the full G6, so seed 12 remains reserved.
              Source ratings updated {FPI_MODEL_METADATA.sourceUpdated}.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
