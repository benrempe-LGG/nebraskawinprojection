import {
  P4_CONFERENCES,
  type ChampionshipPicks,
  type P4Conference,
} from "@/lib/championships";
import {
  buildFpiModelEntry,
  projectFpiGame,
  type FpiGameProjection,
} from "@/lib/fpiModel";
import { projectPlayoffField, type PlayoffOutlook } from "@/lib/playoff";
import {
  computeConferenceStandings,
  type ConferenceStandings,
} from "@/lib/standings";

export interface FpiChampionshipProjection {
  conference: P4Conference;
  firstTeam: string;
  secondTeam: string;
  winner: string;
  projection: FpiGameProjection;
}

export interface FpiSeasonProjection {
  standings: ConferenceStandings;
  championships: FpiChampionshipProjection[];
  playoff: PlayoffOutlook;
}

export function buildFpiSeasonProjection(): FpiSeasonProjection {
  const predictions = buildFpiModelEntry();
  const standings = computeConferenceStandings(predictions);
  for (const rows of Object.values(standings)) {
    rows.sort(
      (a, b) =>
        b.winPercentage - a.winPercentage ||
        b.wins - a.wins ||
        a.losses - b.losses ||
        b.expectedConferenceWins - a.expectedConferenceWins ||
        b.expectedWins - a.expectedWins ||
        a.team.localeCompare(b.team),
    );
  }
  const championshipGames = P4_CONFERENCES.map((conference) => ({
    conference,
    firstTeam: standings[conference][0].team,
    secondTeam: standings[conference][1].team,
  }));
  const championshipPicks: ChampionshipPicks = {};

  const championships = championshipGames.map((game) => {
    const projection = projectFpiGame(game.firstTeam, {
      week: 0,
      date: "DEC 5",
      opponent: game.secondTeam,
      loc: "NEUTRAL",
      venue: "Neutral Site",
    });
    const winner =
      projection.winProbability >= 50 ? game.firstTeam : game.secondTeam;
    championshipPicks[game.conference] = winner;

    return {
      ...game,
      winner,
      projection,
    };
  });

  return {
    standings,
    championships,
    playoff: projectPlayoffField(predictions, championshipPicks),
  };
}
