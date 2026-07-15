import {
  ALL_TEAMS,
  CONFERENCES,
  getProjectedWinner,
  isConferenceGame,
} from "@/lib/oddsmaker";
import {
  getGameId,
  getTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";

export interface ProjectedStanding {
  team: string;
  wins: number;
  losses: number;
  undecided: number;
  overallWins: number;
  overallLosses: number;
  overallUndecided: number;
  projectedGames: number;
  totalConferenceGames: number;
  winPercentage: number;
}

export type ConferenceStandings = Record<string, ProjectedStanding[]>;

export function computeConferenceStandings(
  predictions: GamePredictionStore
): ConferenceStandings {
  const standings: ConferenceStandings = {};
  const seenGames = new Set<string>();

  for (const [conference, teams] of Object.entries(CONFERENCES)) {
    standings[conference] = teams.map((team) => ({
      team,
      wins: 0,
      losses: 0,
      undecided: 0,
      overallWins: 0,
      overallLosses: 0,
      overallUndecided: 0,
      projectedGames: 0,
      totalConferenceGames: ALL_TEAMS[team].schedule.filter((game) =>
        isConferenceGame(game.opponent, team)
      ).length,
      winPercentage: 0,
    }));
  }

  const byTeam = new Map<string, ProjectedStanding>();
  Object.values(standings).flat().forEach((row) => byTeam.set(row.team, row));

  for (const [team, info] of Object.entries(ALL_TEAMS)) {
    for (const game of info.schedule) {
      if (!isConferenceGame(game.opponent, team)) continue;

      const gameId = getGameId(team, game);
      if (seenGames.has(gameId)) continue;
      seenGames.add(gameId);

      const teamRow = byTeam.get(team);
      const opponentRow = byTeam.get(game.opponent);
      if (!teamRow || !opponentRow) continue;

      const value = getTeamGamePrediction(predictions, team, game);
      if (value === "") continue;

      const probability = Number.parseFloat(value);
      if (!Number.isFinite(probability)) continue;

      teamRow.projectedGames += 1;
      opponentRow.projectedGames += 1;

      const winner = getProjectedWinner(team, game, probability);
      if (!winner) {
        teamRow.undecided += 1;
        opponentRow.undecided += 1;
      } else if (winner === team) {
        teamRow.wins += 1;
        opponentRow.losses += 1;
      } else {
        teamRow.losses += 1;
        opponentRow.wins += 1;
      }
    }
  }

  // Overall records are calculated team-by-team from all scheduled games.
  // Conference standings remain sorted exclusively by conference results.
  for (const [team, info] of Object.entries(ALL_TEAMS)) {
    const row = byTeam.get(team);
    if (!row) continue;

    for (const game of info.schedule) {
      const value = getTeamGamePrediction(predictions, team, game);
      if (value === "") continue;

      const winner = getProjectedWinner(team, game, value);
      if (!winner) row.overallUndecided += 1;
      else if (winner === team) row.overallWins += 1;
      else row.overallLosses += 1;
    }
  }

  for (const rows of Object.values(standings)) {
    rows.forEach((row) => {
      const decided = row.wins + row.losses;
      row.winPercentage = decided ? row.wins / decided : 0;
    });
    rows.sort(
      (a, b) =>
        b.winPercentage - a.winPercentage ||
        b.wins - a.wins ||
        a.losses - b.losses ||
        a.team.localeCompare(b.team)
    );
  }

  return standings;
}
