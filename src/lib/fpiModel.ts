import {
  FPI_RATINGS_2026,
  FPI_SOURCE_UPDATED,
  FPI_SOURCE_URL,
} from "@/data/fpiRatings2026";
import { ALL_TEAMS, type Game } from "@/lib/oddsmaker";
import {
  getGameId,
  setTeamGamePrediction,
  type GamePredictionStore,
} from "@/lib/predictionStore";

export const FPI_MODEL_NAME = "2026 FPI-based model";
export const FPI_HOME_FIELD_POINTS = 2.5;
export const FPI_LOGISTIC_SCALE = 12;
export const FPI_UNRATED_OPPONENT = -25;

const ESPN_NAME_BY_APP_NAME: Record<string, string> = {
  "Appalachian State": "App State Mountaineers",
  Arizona: "Arizona Wildcats",
  Arkansas: "Arkansas Razorbacks",
  Cal: "California Golden Bears",
  Colorado: "Colorado Buffaloes",
  Florida: "Florida Gators",
  Georgia: "Georgia Bulldogs",
  Hawaii: "Hawai'i Rainbow Warriors",
  Iowa: "Iowa Hawkeyes",
  Kansas: "Kansas Jayhawks",
  Louisiana: "Louisiana Ragin' Cajuns",
  Miami: "Miami Hurricanes",
  "Miami (OH)": "Miami (OH) RedHawks",
  Michigan: "Michigan Wolverines",
  Missouri: "Missouri Tigers",
  "NC State": "NC State Wolfpack",
  Ohio: "Ohio Bobcats",
  Oklahoma: "Oklahoma Sooners",
  Oregon: "Oregon Ducks",
  Pitt: "Pittsburgh Panthers",
  "San Jose State": "San José State Spartans",
  ULM: "UL Monroe Warhawks",
  UMass: "Massachusetts Minutemen",
  Texas: "Texas Longhorns",
  Utah: "Utah Utes",
  Virginia: "Virginia Cavaliers",
  Washington: "Washington Huskies",
};

const UNRATED_APP_TEAMS = new Set([
  "North Dakota",
]);

export interface FpiTeamRating {
  rating: number;
  rated: boolean;
  espnName: string | null;
}

export interface FpiGameProjection {
  opponent: string;
  location: Game["loc"];
  teamRating: number;
  opponentRating: number;
  opponentRated: boolean;
  expectedMargin: number;
  winProbability: number;
}

export interface FpiModelMetadata {
  name: string;
  sourceUrl: string;
  sourceUpdated: string;
  homeFieldPoints: number;
  logisticScale: number;
  unratedOpponentRating: number;
}

export const FPI_MODEL_METADATA: FpiModelMetadata = {
  name: FPI_MODEL_NAME,
  sourceUrl: FPI_SOURCE_URL,
  sourceUpdated: FPI_SOURCE_UPDATED,
  homeFieldPoints: FPI_HOME_FIELD_POINTS,
  logisticScale: FPI_LOGISTIC_SCALE,
  unratedOpponentRating: FPI_UNRATED_OPPONENT,
};

function inferredEspnName(team: string): string | null {
  if (UNRATED_APP_TEAMS.has(team)) return null;

  const exact = ESPN_NAME_BY_APP_NAME[team];
  if (exact) return exact;

  const candidates = Object.keys(FPI_RATINGS_2026).filter(
    (name) => name === team || name.startsWith(`${team} `),
  );
  return candidates.length === 1 ? candidates[0] : null;
}

export function getFpiTeamRating(team: string): FpiTeamRating {
  const espnName = inferredEspnName(team);
  if (!espnName) {
    return {
      rating: FPI_UNRATED_OPPONENT,
      rated: false,
      espnName: null,
    };
  }

  return {
    rating: FPI_RATINGS_2026[espnName],
    rated: true,
    espnName,
  };
}

export function probabilityFromExpectedMargin(margin: number): number {
  const raw = 100 / (1 + Math.exp(-margin / FPI_LOGISTIC_SCALE));
  return Math.min(99, Math.max(1, Number(raw.toFixed(1))));
}

export function projectFpiGame(
  team: string,
  game: Game,
): FpiGameProjection {
  const teamRating = getFpiTeamRating(team);
  const opponentRating = getFpiTeamRating(game.opponent);
  const locationAdjustment =
    game.loc === "HOME"
      ? FPI_HOME_FIELD_POINTS
      : game.loc === "AWAY"
        ? -FPI_HOME_FIELD_POINTS
        : 0;
  const expectedMargin =
    teamRating.rating - opponentRating.rating + locationAdjustment;

  return {
    opponent: game.opponent,
    location: game.loc,
    teamRating: teamRating.rating,
    opponentRating: opponentRating.rating,
    opponentRated: opponentRating.rated,
    expectedMargin: Number(expectedMargin.toFixed(1)),
    winProbability: probabilityFromExpectedMargin(expectedMargin),
  };
}

export function projectFpiTeam(team: string): FpiGameProjection[] {
  return (ALL_TEAMS[team]?.schedule ?? []).map((game) =>
    projectFpiGame(team, game),
  );
}

export function expectedFpiWins(team: string): number {
  return Number(
    projectFpiTeam(team)
      .reduce((sum, game) => sum + game.winProbability / 100, 0)
      .toFixed(1),
  );
}

export function buildFpiModelEntry(): GamePredictionStore {
  let entry: GamePredictionStore = {};

  for (const team of Object.keys(ALL_TEAMS).sort((a, b) => a.localeCompare(b))) {
    for (const game of ALL_TEAMS[team].schedule) {
      if (entry[getGameId(team, game)]) continue;
      const probability = projectFpiGame(team, game).winProbability.toFixed(1);
      entry = setTeamGamePrediction(entry, team, game, probability);
    }
  }

  return entry;
}
