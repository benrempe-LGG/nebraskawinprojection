import { Link } from "react-router-dom";
import SeasonBallot from "@/components/SeasonBallot";
import { useAuth } from "@/contexts/AuthContext";

const actionLinks = [
  {
    to: "/",
    title: "Continue making picks",
    description: "Move team by team through the full 2026 schedule.",
  },
  {
    to: "/review#remaining",
    title: "Review unfinished games",
    description: "Find every blank or unresolved matchup in one place.",
  },
  {
    to: "/championships",
    title: "Championship Week",
    description: "Choose the conference champions that shape your playoff field.",
  },
  {
    to: "/compare/fpi",
    title: "You vs. FPI",
    description: "Find your biggest team convictions, opposite winners, and playoff differences.",
  },
  {
    to: "/scorecards",
    title: "Weekly scorecards",
    description: "Compare your locked picks with the games as they are played.",
  },
  {
    to: "/groups",
    title: "Private groups",
    description: "Create or join a group and compare entries with friends.",
  },
];

export default function MyEntry() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen gradient-page pb-20">
      <section className="container max-w-[960px] px-4 pt-10">
        <p className="text-[11px] font-bold uppercase tracking-[2px] text-accent font-display">
          Entry dashboard
        </p>
        <h1 className="mt-2 text-3xl font-black text-foreground font-display sm:text-4xl">
          My 2026 Entry
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          {user
            ? "This is your official 2026 season entry. Your regular-season and Championship Week picks save to this account until the entry deadline."
            : "Build your 2026 entry on this device, then sign in to save it across devices, submit it, and receive weekly scorecards."}
        </p>

        {!user && (
          <div className="mt-6 rounded-xl border border-primary/40 bg-primary/10 p-5">
            <p className="font-bold text-foreground">Keep this entry with you</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in before switching devices so your predictions can be restored from the cloud.
            </p>
            <Link
              to="/account"
              className="mt-4 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-black text-primary-foreground"
            >
              Sign in to save my entry
            </Link>
          </div>
        )}
      </section>

      <SeasonBallot revision="entry-dashboard" />

      <section className="container mt-8 grid max-w-[960px] gap-4 px-4 sm:grid-cols-2">
        {actionLinks.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="rounded-xl border border-border bg-surface-alt p-5 transition-colors hover:border-primary"
          >
            <h2 className="font-black text-foreground font-display">{action.title}</h2>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </section>

      <p className="container mt-8 max-w-[960px] px-4 text-xs text-muted-foreground">
        Each account has one official 2026 entry. You can edit a submitted entry until the published deadline; once locked, its picks are preserved for scoring.
      </p>
    </main>
  );
}
