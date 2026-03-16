import { Game, getImpliedSpread, formatSpread, getSpreadSentiment, isConferenceGame } from "@/lib/oddsmaker";

interface GameRowProps {
  game: Game;
  index: number;
  winPct: string;
  onChange: (value: string) => void;
}

const spreadColorClass: Record<string, string> = {
  positive: "text-positive",
  negative: "text-destructive",
  neutral: "text-accent",
  none: "text-muted-foreground",
};

const GameRow = ({ game, index, winPct, onChange }: GameRowProps) => {
  const isHome = game.loc === "HOME";
  const pct = parseFloat(winPct);
  const spread = getImpliedSpread(pct, isHome);
  const sentiment = getSpreadSentiment(spread);
  const isConf = isConferenceGame(game.opponent);
  const isCloseGame = spread !== null && Math.abs(spread) <= 7;
  const dateParts = game.date.split(" ");

  return (
    <div
      className={`grid grid-cols-[70px_1fr_60px_100px_110px] sm:grid-cols-[90px_1fr_72px_140px_140px] items-center px-3 sm:px-4 py-3 sm:py-3.5 border-b border-border transition-colors duration-150 ${
        index % 2 === 0 ? "bg-surface-alt" : "bg-surface"
      } ${isCloseGame ? "border-l-[3px] border-l-primary" : "border-l-[3px] border-l-transparent"}`}
    >
      {/* Date */}
      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-mono-data">
          {dateParts[0]}
        </div>
        <div className="text-xs sm:text-sm font-bold text-foreground/80 font-mono-data">
          {dateParts.slice(1).join(" ")}
        </div>
      </div>

      {/* Opponent */}
      <div className="min-w-0">
        <div className={`text-sm sm:text-base font-bold truncate ${isCloseGame ? "text-accent" : "text-foreground"}`}>
          {isHome ? "vs. " : "at "}
          {game.opponent}
        </div>
        <div className="text-[11px] text-muted-foreground truncate">
          {game.venue}
          {isConf ? " • B1G" : ""}
        </div>
      </div>

      {/* Site badge */}
      <div className="text-center">
        <span
          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wide ${
            isHome
              ? "bg-primary/20 text-primary border border-primary/30"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {game.loc}
        </span>
      </div>

      {/* Win % input */}
      <div className="text-center">
        <div className="relative inline-block">
          <input
            type="text"
            inputMode="decimal"
            value={winPct}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className={`w-16 sm:w-20 py-2 pl-2 pr-6 rounded-md border-2 text-center text-sm sm:text-base font-bold font-mono-data outline-none transition-all duration-200 ${
              winPct
                ? "border-primary/40 bg-primary/10 text-foreground"
                : "border-primary/60 bg-primary/5 text-foreground animate-pulse ring-1 ring-primary/20"
            } focus:border-primary focus:ring-2 focus:ring-primary/30 focus:animate-none`}
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-semibold pointer-events-none font-mono-data">
            %
          </span>
        </div>
      </div>

      {/* Implied spread */}
      <div className={`text-center text-sm sm:text-base font-bold font-mono-data ${spreadColorClass[sentiment]}`}>
        {formatSpread(spread)}
      </div>
    </div>
  );
};

export default GameRow;
