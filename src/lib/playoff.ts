import { ALL_TEAMS, CONFERENCES } from "@/lib/oddsmaker";
import {
  getTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";
import { computeConferenceStandings } from "@/lib/standings";

export interface ProjectedTeamRecord {
  team: string;
  conference: string;
  wins: number;
  losses: number;
  undecided: number;
  pickedGames: number;
  totalGames: number;
  winPercentage: number;
}

export interface PlayoffTeam extends ProjectedTeamRecord {
  seed: number;
  qualification: "P4 champion" | "At-large";
}

export interface PlayoffOutlook {
  teams: PlayoffTeam[];
  groupOfSixSeed: 12;
  complete: boolean;
}

export function computeProjectedTeamRecords(
  predictions: GamePredictionStore
): ProjectedTeamRecord[] {
  return Object.entries(ALL_TEAMS)
    .map(([team, info]) => {
      let wins = 0;
      let losses = 0;
      let undecided = 0;
      let pickedGames = 0;

      info.schedule.forEach((game) => {
        const value = getTeamGamePrediction(predictions, team, game);
        if (value === "") return;

        const probability = Number.parseFloat(value);
        if (!Number.isFinite(probability)) return;
        pickedGames += 1;

        if (probability > 50) wins += 1;
        else if (probability < 50) losses += 1;
        else undecided += 1;
      });

      const decided = wins + losses;
      return {
        team,
        conference: info.conference,
        wins,
        losses,
        undecided,
        pickedGames,
        totalGames: info.schedule.length,
        winPercentage: decided ? wins / decided : 0,
      };
    })
    .sort(compareRecords);
}

function compareRecords(
  a: ProjectedTeamRecord,
  b: ProjectedTeamRecord
): number {
  return (
    b.winPercentage - a.winPercentage ||
    b.wins - a.wins ||
    a.losses - b.losses ||
    a.team.localeCompare(b.team)
  );
}

export function projectPlayoffField(
  predictions: GamePredictionStore
): PlayoffOutlook {
  const records = computeProjectedTeamRecords(predictions);
  const recordByTeam = new Map(records.map((record) => [record.team, record]));
  const standings = computeConferenceStandings(predictions);

  const championNames = Object.keys(CONFERENCES)
    .map((conference) => standings[conference]?.[0]?.team)
    .filter((team): team is string => Boolean(team));
  const champions = new Set(championNames);

  const selected = [
    ...championNames.map((team) => ({
      ...recordByTeam.get(team)!,
      qualification: "P4 champion" as const,
    })),
    ...records
      .filter((record) => !champions.has(record.team))
      .slice(0, 7)
      .map((record) => ({
        ...record,
        qualification: "At-large" as const,
      })),
  ].sort(compareRecords);

  return {
    teams: selected.map((team, index) => ({
      ...team,
      seed: index + 1,
    })),
    groupOfSixSeed: 12,
    complete: records.every(
      (record) =>
        record.pickedGames === record.totalGames && record.undecided === 0
    ),
  };
}
