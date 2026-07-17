import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import html2canvas from "html2canvas";
import { toast } from "sonner";
import {
  CONFERENCES,
  ALL_TEAMS,
  getTeamSchedule,
  getTeamConference,
  isConferenceGame,
  computeDistribution,
} from "@/lib/oddsmaker";
import logoImg from "@/assets/logo.png";
import GameRow from "@/components/GameRow";
import SummaryCards from "@/components/SummaryCards";
import WinDistribution from "@/components/WinDistribution";
import SeasonBallot from "@/components/SeasonBallot";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  loadTeamPredictions,
  saveTeamGamePrediction,
} from "@/lib/predictionStore";

const CONF_ABBR: Record<string, string> = {
  "Big Ten": "B1G",
  SEC: "SEC",
  ACC: "ACC",
  "Big 12": "Big 12",
};

const VEGAS_KEY = "oddsmaker_vegas_totals";
const FAVORITE_TEAM_KEY = "oddsmaker_favorite_team";

const isValidPct = (v: string) =>
  /^\d{0,3}\.?\d{0,2}$/.test(v) && v !== "" && parseFloat(v) <= 100;

// Picks shared via URL: ?t=Nebraska&p=90,85,,55&v=6.5
function parseShareUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("t");
    if (!t || !ALL_TEAMS[t]) return null;
    const preds: Record<number, string> = {};
    const p = params.get("p");
    if (p) {
      p.split(",").forEach((v, i) => {
        if (isValidPct(v)) preds[i] = v;
      });
    }
    const v = params.get("v");
    const vegas = v && /^\d{0,2}\.?\d{0,1}$/.test(v) ? v : "";
    return { team: t, preds, vegas, hasPreds: Object.keys(preds).length > 0 };
  } catch {
    return null;
  }
}

function loadStore(key: string): Record<string, Record<number, string> | string> {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function saveStore(key: string, team: string, value: unknown) {
  try {
    const saved = loadStore(key);
    saved[team] = value as Record<number, string> | string;
    localStorage.setItem(key, JSON.stringify(saved));
  } catch {
    /* ignore */
  }
}

const SHARED = parseShareUrl();

function getSavedFavoriteTeam() {
  try {
    const saved = localStorage.getItem(FAVORITE_TEAM_KEY);
    return saved && ALL_TEAMS[saved] ? saved : null;
  } catch {
    return null;
  }
}

const Index = () => {
  const { user } = useAuth();
  const confList = useMemo(() => Object.keys(CONFERENCES).sort(), []);
  const initialTeam = SHARED?.team || getSavedFavoriteTeam() || "Nebraska";
  const [conf, setConf] = useState(getTeamConference(initialTeam) || "Big Ten");
  const [team, setTeam] = useState(initialTeam);

  const schedule = useMemo(() => getTeamSchedule(team), [team]);
  const teamConf = useMemo(() => getTeamConference(team), [team]);

  const loadPreds = useCallback(
    (t: string) => loadTeamPredictions(localStorage, t, getTeamSchedule(t)),
    []
  );

  const loadVegas = useCallback((t: string) => {
    const saved = loadStore(VEGAS_KEY);
    const v = saved[t];
    return typeof v === "string" ? v : t === "Nebraska" ? "6.5" : "";
  }, []);

  const [winPcts, setWinPcts] = useState<Record<number, string>>(() =>
    SHARED?.hasPreds ? SHARED.preds : loadPreds(initialTeam)
  );
  const [vegasTotal, setVegasTotal] = useState(() =>
    SHARED?.vegas ? SHARED.vegas : loadVegas(initialTeam)
  );
  const captureRef = useRef<HTMLDivElement>(null);
  const skipNextTeamLoad = useRef(SHARED !== null);

  // When team changes, load its saved predictions and Vegas total
  useEffect(() => {
    if (skipNextTeamLoad.current) {
      skipNextTeamLoad.current = false;
      return;
    }
    setWinPcts(loadPreds(team));
    setVegasTotal(loadVegas(team));
  }, [team, loadPreds, loadVegas]);

  useEffect(() => {
    saveStore(VEGAS_KEY, team, vegasTotal);
  }, [vegasTotal, team]);

  // A signed-in entry may be restored from Supabase after the page first renders.
  useEffect(() => {
    const restoreCloudEntry = () => setWinPcts(loadPreds(team));
    window.addEventListener("cloud-entry-loaded", restoreCloudEntry);
    return () => window.removeEventListener("cloud-entry-loaded", restoreCloudEntry);
  }, [team, loadPreds]);

  useEffect(() => {
    if (!user || SHARED) return;

    let active = true;
    supabase
      .from("profiles")
      .select("favorite_team")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!active || error) return;

        const favoriteTeam = data?.favorite_team;
        if (favoriteTeam && ALL_TEAMS[favoriteTeam]) {
          localStorage.setItem(FAVORITE_TEAM_KEY, favoriteTeam);
          setConf(getTeamConference(favoriteTeam) || "Big Ten");
          setTeam(favoriteTeam);
        } else {
          localStorage.removeItem(FAVORITE_TEAM_KEY);
          setConf(getTeamConference("Nebraska") || "Big Ten");
          setTeam("Nebraska");
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  // When conference changes, pick first team in that conference
  const handleConfChange = useCallback((newConf: string) => {
    setConf(newConf);
    const teams = CONFERENCES[newConf];
    if (teams && teams.length > 0) {
      setTeam(teams[0]);
    }
  }, []);

  const nextTeam = useMemo(() => {
    const currentTeams = CONFERENCES[conf] || [];
    const currentIndex = currentTeams.indexOf(team);
    if (currentIndex >= 0 && currentIndex < currentTeams.length - 1) {
      return { conf, team: currentTeams[currentIndex + 1] };
    }

    const confIndex = confList.indexOf(conf);
    for (let offset = 1; offset <= confList.length; offset += 1) {
      const nextConf = confList[(confIndex + offset) % confList.length];
      const nextConfTeams = CONFERENCES[nextConf] || [];
      if (nextConfTeams.length > 0) {
        return { conf: nextConf, team: nextConfTeams[0] };
      }
    }

    return { conf, team };
  }, [conf, confList, team]);

  const handleNextTeam = useCallback(() => {
    setConf(nextTeam.conf);
    setTeam(nextTeam.team);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [nextTeam]);

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

  const handleChange = useCallback(
    (idx: number, val: string) => {
      if (
        val === "" ||
        (/^\d{0,3}\.?\d{0,2}$/.test(val) &&
          (val === "" || parseFloat(val) <= 100))
      ) {
        setWinPcts((prev) => ({ ...prev, [idx]: val }));
        saveTeamGamePrediction(localStorage, team, schedule[idx], val);
      }
    },
    [team, schedule]
  );

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

  const buildShareUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.set("t", team);
    params.set(
      "p",
      schedule.map((_g, i) => winPcts[i] || "").join(",")
    );
    if (vegasTotal) params.set("v", vegasTotal);
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }, [team, schedule, winPcts, vegasTotal]);

  const copyToClipboard = useCallback(async (text: string, message: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch {
      // Fallback for browsers that block the async clipboard API
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) toast.success(message);
        else toast.error("Couldn't copy — your browser blocked clipboard access");
      } catch {
        toast.error("Couldn't copy — your browser blocked clipboard access");
      }
    }
  }, []);

  const handleCopyLink = useCallback(() => {
    copyToClipboard(
      buildShareUrl(),
      "Link copied — anyone who opens it sees your picks"
    );
  }, [buildShareUrl, copyToClipboard]);

  const handleCopyForumPost = useCallback(() => {
    const vegasNum = parseFloat(vegasTotal);
    // Derive losses from the rounded win display so the record sums to the game count
    const winsDisplay = parseFloat(totalExpectedWins.toFixed(1));
    const lossTotal = schedule.length - winsDisplay;

    const probs = schedule.map((_g, i) => {
      const v = parseFloat(winPcts[i] || "");
      return isNaN(v) ? 0 : Math.min(Math.max(v / 100, 0), 1);
    });
    const dist = computeDistribution(probs);
    const bowlProb = dist.slice(6).reduce((s, p) => s + p, 0);

    const gameLines = schedule.map((g, i) => {
      const v = winPcts[i];
      const date = g.date.split(" ").slice(-2).join(" ");
      const site = g.loc === "HOME" ? "vs" : g.loc === "AWAY" ? "at" : "vs*";
      return `${date.padEnd(7)} ${site} ${g.opponent}`.padEnd(32) + (v ? `${v}%` : "—");
    });

    const lines: string[] = [];
    lines.push(
      `🏈 MY 2026 ${team.toUpperCase()} PROJECTION: ${totalExpectedWins.toFixed(1)} WINS`
    );
    if (!isNaN(vegasNum) && filledCount === schedule.length) {
      const diff = totalExpectedWins - vegasNum;
      const lean =
        diff > 0.5 ? "I'm taking the OVER" : diff < -0.5 ? "I'm taking the UNDER" : "dead on the number";
      lines.push(`Vegas win total: ${vegasTotal} → ${lean}`);
    }
    lines.push("");
    lines.push(...gameLines);
    lines.push("");
    lines.push(
      `Projected record: ${totalExpectedWins.toFixed(1)}–${lossTotal.toFixed(1)} (${confWins.toFixed(1)} ${CONF_ABBR[teamConf] || teamConf} wins)`
    );
    if (filledCount === schedule.length) {
      lines.push(`Bowl eligibility odds: ${(bowlProb * 100).toFixed(0)}%`);
    }
    lines.push("");
    lines.push(`Think I'm wrong? Post your own numbers: ${buildShareUrl()}`);

    copyToClipboard(
      lines.join("\n"),
      "Forum post copied — paste it on the board"
    );
  }, [
    team,
    teamConf,
    schedule,
    winPcts,
    vegasTotal,
    totalExpectedWins,
    confWins,
    filledCount,
    buildShareUrl,
    copyToClipboard,
  ]);

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
          <button
            type="button"
            onClick={handleNextTeam}
            className="ml-auto px-4 py-2.5 rounded-lg border border-primary bg-primary text-primary-foreground text-sm font-bold font-display transition-opacity hover:opacity-90"
            aria-label={`Go to next team, ${nextTeam.team}`}
          >
            Next team: {nextTeam.team} →
          </button>
        </div>

        <SeasonBallot revision={team + JSON.stringify(winPcts)} />

        {/* Schedule table */}
        <div className="max-w-[900px] mx-auto px-4 mt-6">
          {/* Table header */}
          <div className="grid grid-cols-[52px_1fr_40px_68px_72px] sm:grid-cols-[90px_1fr_72px_140px_140px] px-2 sm:px-4 py-3 bg-primary rounded-t-lg text-[10px] sm:text-[11px] font-bold uppercase tracking-[1px] sm:tracking-[1.5px] text-primary-foreground font-display">
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
          onVegasTotalChange={setVegasTotal}
        />

        {/* Win Distribution */}
        <WinDistribution winPcts={winPcts} totalGames={schedule.length} />
      </div>
      {/* End capturable region */}

      {/* Share buttons */}
      <div className="max-w-[900px] mx-auto mt-8 px-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleCopyForumPost}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-primary bg-primary text-primary-foreground hover:opacity-90 font-bold text-sm tracking-wide transition-opacity duration-200 font-display"
        >
          📋 Copy Forum Post
        </button>
        <button
          onClick={handleCopyLink}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          🔗 Copy Link to My Picks
        </button>
        <button
          onClick={handleSaveImage}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          📷 Save as Image
        </button>
      </div>

      {/* Season tools */}
      <div className="max-w-[900px] mx-auto mt-8 px-4 flex flex-wrap justify-center gap-3">
        <Link
          to="/standings"
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground text-accent font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          🏆 Projected Conference Standings
        </Link>
        <Link
          to="/playoff"
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-primary bg-primary/10 hover:bg-primary hover:text-primary-foreground text-accent font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          🏈 2026 Playoff Outlook
        </Link>
        <Link
          to="/analytics"
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-muted hover:bg-primary hover:text-primary-foreground text-muted-foreground font-bold text-sm tracking-wide transition-colors duration-200 font-display"
        >
          📊 Program Analytics
        </Link>
      </div>

      {/* Info pills */}
      <div className="max-w-[900px] mx-auto flex flex-wrap justify-center gap-3 px-4 mt-6">
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
          Predictions save once per matchup — enter a percentage for either team and the opponent's
          schedule updates automatically with the complementary probability.
          Use <strong className="text-foreground/60">Copy Link to My Picks</strong> to challenge
          others: anyone who opens your link sees your exact numbers and can post their own back.
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
