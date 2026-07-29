import { getSeasonGames } from "@/lib/ballot";
import {
  championshipPicksComplete,
  getChampionshipGames,
  type ChampionshipPicks,
} from "@/lib/championships";
import { buildFpiModelEntry } from "@/lib/fpiModel";
import { buildFpiSeasonProjection } from "@/lib/fpiSeason";
import { getProjectedWinner } from "@/lib/oddsmaker";
import { projectPlayoffField, type PlayoffTeam } from "@/lib/playoff";
import {
  getTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";
import {
  computeConferenceStandings,
  type ConferenceStandings,
  type ProjectedStanding,
} from "@/lib/standings";

export interface TeamFpiComparison {
  team: string;
  conference: string;
  comparedGames: number;
  totalGames: number;
  userExpectedWins: number;
  fpiExpectedWinsOnComparedGames: number;
  fpiFullExpectedWins: number;
  expectedWinGap: number;
  userProjectedRecord: string;
  fpiProjectedRecord: string;
}

export interface GameFpiComparison {
  id: string;
  team: string;
  opponent: string;
  location: "HOME" | "AWAY" | "NEUTRAL";
  userProbability: number;
  fpiProbability: number;
  probabilityGap: number;
  userWinner: string | null;
  fpiWinner: string | null;
}

export interface EntryFpiComparison {
  comparedGames: number;
  totalGames: number;
  averageProbabilityGap: number;
  teams: TeamFpiComparison[];
  games: GameFpiComparison[];
  oppositeWinners: GameFpiComparison[];
  userStandings: ConferenceStandings;
  fpiStandings: ConferenceStandings;
  userPlayoffComplete: boolean;
  userPlayoff: PlayoffTeam[];
  fpiPlayoff: PlayoffTeam[];
  userOnlyPlayoffTeams: string[];
  fpiOnlyPlayoffTeams: string[];
}

function recordLabel(row: ProjectedStanding | undefined): string {
  if (!row) return "0-0";
  const undecided = row.overallUndecided ? `-${row.overallUndecided}` : "";
  return `${row.overallWins}-${row.overallLosses}${undecided}`;
}

export function compareEntryToFpi(
  predictions: GamePredictionStore,
  championshipPicks: ChampionshipPicks = {},
): EntryFpiComparison {
  const fpiPredictions = buildFpiModelEntry();
  const fpiSeason = buildFpiSeasonProjection();
  const seasonGames = getSeasonGames();
  const userStandings = computeConferenceStandings(predictions);
  const userRows = new Map(
    Object.values(userStandings).flat().map((row) => [row.team, row]),
  );
  const fpiRows = new Map(
    Object.values(fpiSeason.standings).flat().map((row) => [row.team, row]),
  );

  const games = seasonGames.flatMap(({ id, team, game }) => {
    const userValue = getTeamGamePrediction(predictions, team, game);
    const fpiValue = getTeamGamePrediction(fpiPredictions, team, game);
    if (userValue === "" || fpiValue === "") return [];

    const userProbability = Number.parseFloat(userValue);
    const fpiProbability = Number.parseFloat(fpiValue);
    if (!Number.isFinite(userProbability) || !Number.isFinite(fpiProbability)) {
      return [];
    }

    return [{
      id,
      team,
      opponent: game.opponent,
      location: game.loc,
      userProbability,
      fpiProbability,
      probabilityGap: userProbability - fpiProbability,
      userWinner: getProjectedWinner(team, game, userProbability),
      fpiWinner: getProjectedWinner(team, game, fpiProbability),
    }];
  });

  const teamGames = new Map<string, GameFpiComparison[]>();
  for (const game of games) {
    for (const team of [game.team, game.opponent]) {
      const values = teamGames.get(team) ?? [];
      values.push(game);
      teamGames.set(team, values);
    }
  }

  const teams = [...fpiRows.entries()].map(([team, fpiRow]) => {
    const compared = teamGames.get(team) ?? [];
    let userExpectedWins = 0;
    let fpiExpectedWinsOnComparedGames = 0;
    for (const game of compared) {
      const teamIsStoredSide = game.team === team;
      userExpectedWins +=
        (teamIsStoredSide ? game.userProbability : 100 - game.userProbability) / 100;
      fpiExpectedWinsOnComparedGames +=
        (teamIsStoredSide ? game.fpiProbability : 100 - game.fpiProbability) / 100;
    }

    return {
      team,
      conference: fpiRow ? Object.entries(fpiSeason.standings)
        .find(([, rows]) => rows.some((row) => row.team === team))?.[0] ?? "" : "",
      comparedGames: compared.length,
      totalGames: fpiRow.overallWins + fpiRow.overallLosses + fpiRow.overallUndecided,
      userExpectedWins,
      fpiExpectedWinsOnComparedGames,
      fpiFullExpectedWins: fpiRow.expectedWins,
      expectedWinGap: userExpectedWins - fpiExpectedWinsOnComparedGames,
      userProjectedRecord: recordLabel(userRows.get(team)),
      fpiProjectedRecord: recordLabel(fpiRow),
    };
  }).sort(
    (a, b) =>
      Math.abs(b.expectedWinGap) - Math.abs(a.expectedWinGap) ||
      a.team.localeCompare(b.team),
  );

  const championshipGames = getChampionshipGames(predictions);
  const championshipSelectionComplete = championshipPicksComplete(
    championshipGames,
    championshipPicks,
  );
  const userPlayoffOutlook = championshipSelectionComplete
    ? projectPlayoffField(predictions, championshipPicks)
    : null;
  const userPlayoffComplete =
    games.length === seasonGames.length &&
    userPlayoffOutlook?.complete === true;
  const userPlayoff = userPlayoffComplete ? userPlayoffOutlook.teams : [];
  const fpiPlayoff = fpiSeason.playoff.teams;
  const userNames = new Set(userPlayoff.map((team) => team.team));
  const fpiNames = new Set(fpiPlayoff.map((team) => team.team));

  return {
    comparedGames: games.length,
    totalGames: seasonGames.length,
    averageProbabilityGap: games.length
      ? games.reduce((sum, game) => sum + Math.abs(game.probabilityGap), 0) / games.length
      : 0,
    teams,
    games: [...games].sort(
      (a, b) => Math.abs(b.probabilityGap) - Math.abs(a.probabilityGap),
    ),
    oppositeWinners: games.filter(
      (game) =>
        game.userWinner !== null &&
        game.fpiWinner !== null &&
        game.userWinner !== game.fpiWinner,
    ).sort((a, b) => Math.abs(b.probabilityGap) - Math.abs(a.probabilityGap)),
    userStandings,
    fpiStandings: fpiSeason.standings,
    userPlayoffComplete,
    userPlayoff,
    fpiPlayoff,
    userOnlyPlayoffTeams: userPlayoff
      .filter((team) => !fpiNames.has(team.team))
      .map((team) => team.team),
    fpiOnlyPlayoffTeams: fpiPlayoff
      .filter((team) => !userNames.has(team.team))
      .map((team) => team.team),
  };
}
