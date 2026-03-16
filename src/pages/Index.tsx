import { useState, useEffect, useCallback, useRef } from "react";
import html2canvas from "html2canvas";
import { SCHEDULE, isConferenceGame } from "@/lib/oddsmaker";
import { fetchVegasWinTotal } from "@/lib/vegasApi";
import logoImg from "@/assets/logo.png";
import GameRow from "@/components/GameRow";
import SummaryCards from "@/components/SummaryCards";

const Index = () => {
  const [winPcts, setWinPcts] = useState<string[]>(() => SCHEDULE.map(() => ""));
  const [vegasTotal, setVegasTotal] = useState("6.5");
  const [vegasSource, setVegasSource] = useState<string | null>(null);
  const [vegasLoading, setVegasLoading] = useState(true);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVegasWinTotal()
      .then((result) => {
        if (result && result.total !== null) {
          setVegasTotal(String(result.total));
          setVegasSource(result.book || "The Odds API");
        }
        setVegasLoading(false);
      })
      .catch(() => setVegasLoading(false));
  }, []);

  const handleSaveImage = useCallback(async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: "#0d0d0d",
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = "husker-oddsmaker.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Screenshot failed:", e);
    }
  }, []);

  const handleChange = useCallback((idx: number, val: string) => {
    if (val === "" || (/^\d{0,3}\.?\d{0,2}$/.test(val) && (val === "" || parseFloat(val) <= 100))) {
      setWinPcts((prev) => {
        const next = [...prev];
        next[idx] = val;
        return next;
      });
    }
  }, []);

  const totalExpectedWins = winPcts.reduce((sum, pct) => {
    const n = parseFloat(pct);
    return sum + (isNaN(n) ? 0 : n / 100);
  }, 0);

  const filledCount = winPcts.filter((p) => p !== "" && !isNaN(parseFloat(p))).length;

  const confWins = SCHEDULE.reduce((sum, game, i) => {
    if (!isConferenceGame(game.opponent)) return sum;
    const n = parseFloat(winPcts[i]);
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
          <img src={logoImg} alt="The Husker Oddsmaker" className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]" />
          <div className="text-center">
            <h1 className="text-2xl sm:text-[32px] font-black tracking-tight text-primary-foreground glow-header leading-none font-display">
              THE HUSKER ODDSMAKER
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm font-medium text-accent tracking-[3px] uppercase font-display">
              Nebraska 2026 Expected Win Calculator
            </p>
          </div>
        </div>
      </header>




      {/* Schedule table */}
      <div className="max-w-[900px] mx-auto px-4">
        {/* Table header */}
        <div className="grid grid-cols-[70px_1fr_60px_100px_110px] sm:grid-cols-[90px_1fr_72px_140px_140px] px-3 sm:px-4 py-3 bg-primary rounded-t-lg text-[11px] font-bold uppercase tracking-[1.5px] text-primary-foreground font-display">
          <span>Date</span>
          <span>Opponent</span>
          <span className="text-center">Site</span>
          <span className="text-center">Win %</span>
          <span className="text-center">Spread</span>
        </div>

        {/* Rows */}
        {SCHEDULE.map((game, idx) => (
          <GameRow
            key={idx}
            game={game}
            index={idx}
            winPct={winPcts[idx]}
            onChange={(val) => handleChange(idx, val)}
          />
        ))}

        {/* Bottom bar */}
        <div className="h-1 bg-primary rounded-b-lg" />
      </div>

      {/* Summary */}
      <SummaryCards
        totalExpectedWins={totalExpectedWins}
        filledCount={filledCount}
        confWins={confWins}
        vegasTotal={vegasTotal}
        onVegasTotalChange={(v) => {
          setVegasTotal(v);
          setVegasSource(null);
        }}
        vegasLoading={vegasLoading}
        vegasSource={vegasSource}
      />
      </div>{/* End capturable region */}

      {/* Save as Image button */}
      <div className="max-w-[900px] mx-auto mt-5 px-4 flex justify-center">
        <button
          onClick={handleSaveImage}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          📷 Save &amp; Share
        </button>
      </div>

      {/* Methodology */}
      <div className="max-w-[900px] mx-auto mt-7 px-4">
        <div className="bg-surface-alt border border-border rounded-lg p-5 text-[13px] text-muted-foreground leading-relaxed">
          <strong className="text-foreground/60">How the spread math works:</strong> Your expected win % is
          converted to a neutral-site point spread using a logit function. The formula is:{" "}
          <code className="text-accent bg-background px-1.5 py-0.5 rounded text-xs font-mono-data">
            spread = ln(p/(1-p)) × 8.0
          </code>{" "}
          where p is your win probability. Then we apply a{" "}
          <strong className="text-foreground/60">2.75-point home-field advantage</strong> — so at 50% win
          probability, a home game shows NEB -2.5 and an away game shows OPP -2.5.
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-[900px] mx-auto mt-6 px-4 text-center text-[11px] text-muted-foreground/50">
        For entertainment &amp; analysis purposes only. Not affiliated with the University of Nebraska.
      </div>
    </div>
  );
};

export default Index;
