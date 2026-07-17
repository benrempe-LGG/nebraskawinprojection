import { computeConferenceStandings } from "@/lib/standings";
import type { GamePredictionStore } from "@/lib/predictionStore";

export const CHAMPIONSHIP_PICKS_KEY = "oddsmaker_championship_picks_v1";
export const P4_CONFERENCES = ["ACC", "Big 12", "Big Ten", "SEC"] as const;

export type P4Conference = (typeof P4_CONFERENCES)[number];
export type ChampionshipPicks = Partial<Record<P4Conference, string>>;

export interface ChampionshipGame {
  conference: P4Conference;
  firstTeam: string;
  secondTeam: string;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getChampionshipGames(
  predictions: GamePredictionStore
): ChampionshipGame[] {
  const standings = computeConferenceStandings(predictions);

  return P4_CONFERENCES.flatMap((conference) => {
    const rows = standings[conference] || [];
    if (rows.length < 2) return [];
    return [{
      conference,
      firstTeam: rows[0].team,
      secondTeam: rows[1].team,
    }];
  });
}

export function loadChampionshipPicks(
  storage: StorageLike,
  games: ChampionshipGame[]
): ChampionshipPicks {
  let saved: ChampionshipPicks = {};
  try {
    saved = JSON.parse(storage.getItem(CHAMPIONSHIP_PICKS_KEY) || "{}");
  } catch {
    saved = {};
  }

  const valid: ChampionshipPicks = {};
  games.forEach((game) => {
    const winner = saved[game.conference];
    if (winner === game.firstTeam || winner === game.secondTeam) {
      valid[game.conference] = winner;
    }
  });

  if (JSON.stringify(saved) !== JSON.stringify(valid)) {
    storage.setItem(CHAMPIONSHIP_PICKS_KEY, JSON.stringify(valid));
  }
  return valid;
}

export function saveChampionshipPick(
  storage: StorageLike,
  games: ChampionshipGame[],
  conference: P4Conference,
  winner: string
): ChampionshipPicks {
  const current = loadChampionshipPicks(storage, games);
  const game = games.find((candidate) => candidate.conference === conference);
  if (!game || (winner !== game.firstTeam && winner !== game.secondTeam)) {
    return current;
  }

  const next = { ...current, [conference]: winner };
  storage.setItem(CHAMPIONSHIP_PICKS_KEY, JSON.stringify(next));
  return next;
}

export function championshipPicksComplete(
  games: ChampionshipGame[],
  picks: ChampionshipPicks
): boolean {
  return games.length === P4_CONFERENCES.length &&
    games.every((game) =>
      picks[game.conference] === game.firstTeam ||
      picks[game.conference] === game.secondTeam
    );
}
