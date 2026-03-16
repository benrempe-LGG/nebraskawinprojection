export interface Game {
  week: number;
  date: string;
  opponent: string;
  loc: "HOME" | "AWAY";
  venue: string;
}

export const SCHEDULE: Game[] = [
  { week: 1, date: "SAT SEP 5", opponent: "Ohio", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 2, date: "SAT SEP 12", opponent: "Bowling Green", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 3, date: "SAT SEP 19", opponent: "North Dakota", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 4, date: "SAT SEP 26", opponent: "Michigan State", loc: "AWAY", venue: "East Lansing, Mich." },
  { week: 5, date: "SAT OCT 3", opponent: "Maryland", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 6, date: "SAT OCT 10", opponent: "Indiana", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 7, date: "SAT OCT 17", opponent: "Oregon", loc: "AWAY", venue: "Eugene, Ore." },
  { week: 8, date: "SAT OCT 31", opponent: "Washington", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 9, date: "SAT NOV 7", opponent: "Illinois", loc: "AWAY", venue: "Champaign, Ill." },
  { week: 10, date: "SAT NOV 14", opponent: "Rutgers", loc: "AWAY", venue: "Piscataway, N.J." },
  { week: 11, date: "SAT NOV 21", opponent: "Ohio State", loc: "HOME", venue: "Lincoln, Neb." },
  { week: 12, date: "FRI NOV 27", opponent: "Iowa", loc: "AWAY", venue: "Iowa City, Iowa" },
];

const NON_CONF = ["Ohio", "Bowling Green", "North Dakota"];

export function isConferenceGame(opponent: string): boolean {
  return !NON_CONF.includes(opponent);
}

function winPctToFairSpread(winPct: number): number {
  if (winPct <= 0 || winPct >= 100) return winPct <= 0 ? 50 : -50;
  const p = winPct / 100;
  const logit = Math.log(p / (1 - p));
  return logit * 8.0;
}

export function getImpliedSpread(winPct: number, isHome: boolean): number | null {
  if (isNaN(winPct) || winPct < 0 || winPct > 100) return null;
  const neutralSpread = winPctToFairSpread(winPct);
  const HFA = 2.75;
  return isHome ? neutralSpread - HFA : neutralSpread + HFA;
}

export function formatSpread(spread: number | null): string {
  if (spread === null) return "—";
  const abs = Math.abs(spread);
  if (abs < 0.5) return "Pick'em";
  const rounded = Math.round(abs * 2) / 2;
  if (spread < 0) return `NEB -${rounded.toFixed(1)}`;
  return `OPP -${rounded.toFixed(1)}`;
}

export type SpreadSentiment = "positive" | "negative" | "neutral" | "none";

export function getSpreadSentiment(spread: number | null): SpreadSentiment {
  if (spread === null) return "none";
  if (Math.abs(spread) < 0.5) return "neutral";
  if (spread < 0) return "positive";
  return "negative";
}
