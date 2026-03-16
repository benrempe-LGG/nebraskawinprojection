import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import html2canvas from "html2canvas";
import {
  CONFERENCES,
  ALL_TEAMS,
  getTeamSchedule,
  getTeamConference,
  isConferenceGame,
} from "@/lib/oddsmaker";
import { fetchVegasWinTotal } from "@/lib/vegasApi";
import logoImg from "@/assets/logo.png";
import GameRow from "@/components/GameRow";
import SummaryCards from "@/components/SummaryCards";
import WinDistribution from "@/components/WinDistribution";

const CONF_ABBR: Record<string, string> = {
  "Big Ten": "B1G",
  SEC: "SEC",
  ACC: "ACC",
  "Big 12": "Big 12",
};

const PREDS_KEY = "oddsmaker_preds";

const Index = () => {
  const confList = useMemo(() => Object.keys(CONFERENCES).sort(), []);
  const [conf, setConf] = useState("Big Ten");
  const [team, setTeam] = useState("Nebraska");

  const schedule = useMemo(() => getTeamSchedule(team), [team]);
  const teamConf = useMemo(() => getTeamConference(team), [team]);

  // Load saved predictions for current team
  const loadPreds = useCallback(
    (t: string) => {
      try {
        const saved = JSON.parse(localStorage.getItem(PREDS_KEY) || "{}");
        return saved[t] || {};
      } catch {
        return {};
      }
    },
    []
  );

  const [winPcts, setWinPcts] = useState<Record<number, string>>(() => loadPreds("Nebraska"));
  const [vegasTotal, setVegasTotal] = useState("6.5");
  const [vegasSource, setVegasSource] = useState<string | null>(null);
  const [vegasLoading, setVegasLoading] = useState(true);
  const captureRef = useRef<HTMLDivElement>(null);

  // When team changes, load its predictions and fetch Vegas line
  useEffect(() => {
    setWinPcts(loadPreds(team));
    setVegasLoading(true);
    setVegasSource(null);
    setVegasTotal("");
    fetchVegasWinTotal(team)
      .then((result) => {
        if (result && result.total !== null) {
          setVegasTotal(String(result.total));
          setVegasSource(result.book || "The Odds API");
        }
        setVegasLoading(false);
      })
      .catch(() => setVegasLoading(false));
  }, [team, loadPreds]);

  // Save predictions whenever they change
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREDS_KEY) || "{}");
      saved[team] = winPcts;
      localStorage.setItem(PREDS_KEY, JSON.stringify(saved));
    } catch {
      /* ignore */
    }
  }, [winPcts, team]);

  // When conference changes, pick first team in that conference
  const handleConfChange = useCallback(
    (newConf: string) => {
      setConf(newConf);
      const teams = CONFERENCES[newConf];
      if (teams && teams.length > 0) {
        setTeam(teams[0]);
      }
    },
    []
  );

  const handleSaveImage = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0d0d0d",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `${team.toLowerCase().replace(/\s+/g, "-")}-oddsmaker.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Screenshot failed:", e);
    }
  }, [team]);

  const handleChange = useCallback((idx: number, val: string) => {
    if (
      val === "" ||
      (/^\d{0,3}\.?\d{0,2}$/.test(val) && (val === "" || parseFloat(val) <= 100))
    ) {
      setWinPcts((prev) => ({ ...prev, [idx]: val }));
    }
  }, []);

  const totalExpectedWins = schedule.reduce((sum, _g, i) => {
    const n = parseFloat(winPcts[i] || "");
    return sum + (isNaN(n) ? 0 : n / 100);
  }, 0);

  const filledCount = schedule.filter((_g, i) => {
    const v = winPcts[i];
    return v !== "" && v !== undefined && !isNaN(parseFloat(v));
  }).length;

  const confGames = schedule.filter((g) => isConferenceGame(g.opponent, team));
  const confGameCount = confGames.length;
  const confWins = schedule.reduce((sum, game, i) => {
    if (!isConferenceGame(game.opponent, team)) return sum;
    const n = parseFloat(winPcts[i] || "");
    return sum + (isNaN(n) ? 0 : n / 100);
  }, 0);

  return (
    <div className="min-h-screen gradient-page pb-20">

      {/* Capturable region */}
      <div ref={captureRef}>

        {/* Header */}
        <header className="gradient-header relative overflow-hidden border-b-2 border-primary shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-0 opacity-[0.06] texture-overlay" />
          <div className="relative flex items-center justify-center gap-5 py-6 px-5">
            <img src={logoImg} alt="The P4 Oddsmaker" className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
            <div className="text-center">
              <h1 className="text-2xl sm:text-[32px] font-black tracking-tight text-primary-foreground glow-header leading-none font-display">
                THE P4 ODDSMAKER
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-accent tracking-[3px] uppercase font-display">
                2026 Expected Win Calculator
              </p>
            </div>
          </div>
        </header>

        {/* Team Picker */}
        <div className="max-w-[900px] mx-auto mt-6 px-4 flex flex-wrap items-center gap-3">
          <select
            value={conf}
            onChange={(e) => handleConfChange(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-accent text-sm font-bold font-display cursor-pointer outline-none focus:border-primary transition-colors duration-200"
          >
            {confList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="px-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm font-semibold font-display cursor-pointer outline-none focus:border-primary transition-colors duration-200 min-w-[200px]"
          >
            {(CONFERENCES[conf] || []).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Schedule table */}
        <div className="max-w-[900px] mx-auto px-4 mt-6">
          {/* Table header */}
          <div className="grid grid-cols-[70px_1fr_60px_100px_110px] sm:grid-cols-[90px_1fr_72px_140px_140px] px-3 sm:px-4 py-3 bg-primary rounded-t-lg text-[11px] font-bold uppercase tracking-[1.5px] text-primary-foreground font-display">
            <span>Date</span>
            <span>Opponent</span>
            <span className="text-center">Site</span>
            <span className="text-center">Win %</span>
            <span className="text-center">Spread</span>
          </div>

          {/* Rows */}
          {schedule.map((game, idx) => (
            <GameRow
              key={idx}
              game={game}
              index={idx}
              winPct={winPcts[idx] || ""}
              onChange={(val) => handleChange(idx, val)}
              teamName={team}
            />
          ))}

          {/* Bottom bar */}
          <div className="h-1 bg-primary rounded-b-lg" />
        </div>

        {/* Summary */}
        <SummaryCards
          totalExpectedWins={totalExpectedWins}
          filledCount={filledCount}
          totalGames={schedule.length}
          confWins={confWins}
          confGameCount={confGameCount}
          confAbbr={CONF_ABBR[teamConf] || teamConf}
          vegasTotal={vegasTotal}
          onVegasTotalChange={(v) => {
            setVegasTotal(v);
            setVegasSource(null);
          }}
          vegasLoading={vegasLoading}
          vegasSource={vegasSource}
        />
      </div>
      {/* End capturable region */}

      {/* Save as Image button */}
      <div className="max-w-[900px] mx-auto mt-8 px-4 flex justify-center">
        <button
          onClick={handleSaveImage}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          📷 Save &amp; Share
        </button>
      </div>

      {/* Info pills */}
      <div className="max-w-[900px] mx-auto flex flex-wrap justify-center gap-3 px-4 mt-8">
        {[
          "Home-field advantage: 2.75 pts",
          "Spread = logit(win%) × 8.0 ± HFA",
          `${Object.keys(ALL_TEAMS).length} Power 4 teams`,
        ].map((text) => (
          <span
            key={text}
            className="bg-muted px-3.5 py-1.5 rounded-md border border-border text-xs text-muted-foreground font-mono-data"
          >
            {text}
          </span>
        ))}
      </div>

      {/* Methodology */}
      <div className="max-w-[900px] mx-auto mt-6 px-4">
        <div className="bg-surface-alt border border-border rounded-lg p-5 text-[13px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground/60">How the spread math works:</strong> Your expected
          win % is converted to a neutral-site point spread using a logit function. The formula is:{" "}
          <code className="text-accent bg-background px-1.5 py-0.5 rounded text-xs font-mono-data">
            spread = ln(p/(1-p)) × 8.0
          </code>{" "}
          where p is your win probability. Then we apply a{" "}
          <strong className="text-foreground/60">2.75-point home-field advantage</strong>.
          Predictions save locally per team — switch between schools without losing your work.
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[900px] mx-auto mt-6 px-4 text-center text-[11px] text-muted-foreground/50">
        For entertainment &amp; analysis purposes only. Not affiliated with any university.
      </div>
    </div>
  );
};

export default Index;
