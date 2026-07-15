import {
  ALL_TEAMS,
  CONFERENCES,
  getProjectedWinner,
  type Game,
} from "@/lib/oddsmaker";
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
  selectionScore: number;
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

const CONFERENCE_STRENGTH: Record<string, number> = {
  SEC: 0.08,
  "Big Ten": 0.08,
  Independent: 0.04,
  ACC: 0,
  "Big 12": 0,
};

const NOTRE_DAME_SCHEDULE: Game[] = [
  { week: 1, date: "SEP 6", opponent: "Wisconsin", loc: "NEUTRAL", venue: "Lambeau Field" },
  { week: 2, date: "SEP 12", opponent: "Rice", loc: "HOME", venue: "Home" },
  { week: 3, date: "SEP 19", opponent: "Michigan State", loc: "HOME", venue: "Home" },
  { week: 4, date: "SEP 26", opponent: "Purdue", loc: "AWAY", venue: "Away" },
  { week: 5, date: "OCT 3", opponent: "North Carolina", loc: "AWAY", venue: "Away" },
  { week: 6, date: "OCT 10", opponent: "Stanford", loc: "HOME", venue: "Home" },
  { week: 7, date: "OCT 17", opponent: "BYU", loc: "AWAY", venue: "Away" },
  { week: 8, date: "OCT 31", opponent: "Navy", loc: "NEUTRAL", venue: "Gillette Stadium" },
  { week: 9, date: "NOV 7", opponent: "Miami", loc: "HOME", venue: "Home" },
  { week: 10, date: "NOV 14", opponent: "Boston College", loc: "HOME", venue: "Home" },
  { week: 11, date: "NOV 21", opponent: "SMU", loc: "HOME", venue: "Home" },
  { week: 12, date: "NOV 28", opponent: "Syracuse", loc: "AWAY", venue: "Away" },
];

const NOTRE_DAME_ASSUMED_WINS = new Set(["Rice", "Navy"]);

function scoreRecord(record: Omit<ProjectedTeamRecord, "selectionScore">): ProjectedTeamRecord {
  return {
    ...record,
    selectionScore:
      record.winPercentage + (CONFERENCE_STRENGTH[record.conference] || 0),
  };
}

function buildRecord(
  team: string,
  conference: string,
  schedule: Game[],
  predictions: GamePredictionStore,
  assumedWins = new Set<string>()
): ProjectedTeamRecord {
  let wins = 0;
  let losses = 0;
  let undecided = 0;
  let pickedGames = 0;

  schedule.forEach((game) => {
    if (assumedWins.has(game.opponent)) {
      wins += 1;
      pickedGames += 1;
      return;
    }

    const value = getTeamGamePrediction(predictions, team, game);
    if (value === "") return;

    pickedGames += 1;
    const winner = getProjectedWinner(team, game, value);
    if (!winner) undecided += 1;
    else if (winner === team) wins += 1;
    else losses += 1;
  });

  const decided = wins + losses;
  return scoreRecord({
    team,
    conference,
    wins,
    losses,
    undecided,
    pickedGames,
    totalGames: schedule.length,
    winPercentage: decided ? wins / decided : 0,
  });
}

export function computeProjectedTeamRecords(
  predictions: GamePredictionStore
): ProjectedTeamRecord[] {
  const records = Object.entries(ALL_TEAMS).map(([team, info]) =>
    buildRecord(team, info.conference, info.schedule, predictions)
  );

  records.push(
    buildRecord(
      "Notre Dame",
      "Independent",
      NOTRE_DAME_SCHEDULE,
      predictions,
      NOTRE_DAME_ASSUMED_WINS
    )
  );

  return records.sort(compareRecords);
}

function compareRecords(
  a: ProjectedTeamRecord,
  b: ProjectedTeamRecord
): number {
  return (
    b.selectionScore - a.selectionScore ||
    b.winPercentage - a.winPercentage ||
    b.wins - a.wins ||
    a.losses - b.losses ||
    a.team.localeCompare(b.team)
  );
}

function isAccOrBig12(record: ProjectedTeamRecord): boolean {
  return record.conference === "ACC" || record.conference === "Big 12";
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
  const selectedRecords = championNames.map((team) => ({
    ...recordByTeam.get(team)!,
    qualification: "P4 champion" as const,
  }));

  let accBig12Count = selectedRecords.filter(isAccOrBig12).length;
  for (const record of records) {
    if (selectedRecords.length === 11) break;
    if (champions.has(record.team)) continue;
    if (isAccOrBig12(record) && accBig12Count >= 4) continue;

    selectedRecords.push({
      ...record,
      qualification: "At-large" as const,
    });
    if (isAccOrBig12(record)) accBig12Count += 1;
  }

  selectedRecords.sort(compareRecords);

  return {
    teams: selectedRecords.map((team, index) => ({
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
