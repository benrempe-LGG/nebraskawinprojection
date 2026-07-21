import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ALL_TEAMS } from "@/lib/oddsmaker";

const FAVORITE_TEAM_KEY = "oddsmaker_favorite_team";
const TEAM_OPTIONS = Object.keys(ALL_TEAMS).sort((a, b) => a.localeCompare(b));

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [favoriteTeam, setFavoriteTeam] = useState("");
  const [savingTeam, setSavingTeam] = useState(false);

  useEffect(() => {
    if (!user) return;
    const postAuthPath = sessionStorage.getItem("post_auth_path");
    if (!postAuthPath) return;
    sessionStorage.removeItem("post_auth_path");
    navigate(postAuthPath, { replace: true });
  }, [navigate, user]);

  useEffect(() => {
    if (!user) {
      setDisplayName("");
      setFavoriteTeam("");
      return;
    }

    let active = true;
    supabase
      .from("profiles")
      .select("display_name, favorite_team")
      .eq("id", user.id)
      .single()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          toast.error("Could not load your favorite team: " + error.message);
          return;
        }
        const savedName =
          data?.display_name ||
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "");
        const savedTeam = data?.favorite_team || "";
        setDisplayName(savedName);
        setFavoriteTeam(savedTeam);
        if (savedTeam && ALL_TEAMS[savedTeam]) {
          localStorage.setItem(FAVORITE_TEAM_KEY, savedTeam);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  async function saveDisplayName() {
    if (!user) return;
    const trimmedName = displayName.trim();
    if (trimmedName.length < 2) {
      toast.error("Display name must be at least 2 characters.");
      return;
    }

    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: trimmedName })
      .eq("id", user.id);
    setSavingName(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    setDisplayName(trimmedName);
    toast.success("Your group display name was saved.");
  }

  async function saveFavoriteTeam() {
    if (!user || !favoriteTeam) return;
    setSavingTeam(true);
    const { error } = await supabase
      .from("profiles")
      .update({ favorite_team: favoriteTeam })
      .eq("id", user.id);
    setSavingTeam(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    localStorage.setItem(FAVORITE_TEAM_KEY, favoriteTeam);
    window.dispatchEvent(new CustomEvent("favorite-team-changed", { detail: favoriteTeam }));
    toast.success(favoriteTeam + " will open first when you sign in.");
  }

  const redirectTo = new URL("account", new URL(import.meta.env.BASE_URL, window.location.origin)).toString();

  async function sendMagicLink(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });
    setSubmitting(false);
    if (error) toast.error(error.message);
    else toast.success("Check your email for a secure sign-in link.");
  }

  async function signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) toast.error(error.message);
  }

  if (loading) return <main className="container py-12">Loading account…</main>;

  return (
    <main className="container max-w-2xl py-12">
      <h1 className="sr-only">
        {user ? "Account and entry settings" : "Save your 2026 entry"}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>{user ? "Account & entry settings" : "Save your 2026 entry"}</CardTitle>
          <CardDescription>
            {user
              ? "Manage your official entry, favorite team, groups, and weekly results."
              : "Sign in to save predictions across devices, submit your entry, and receive weekly scorecards."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <p className="text-sm">Signed in as <strong>{user.email}</strong></p>

              <Button asChild className="w-full">
                <Link to="/entry">Open my 2026 entry</Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link to="/">Continue making picks</Link>
              </Button>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <label htmlFor="display-name" className="text-sm font-bold text-foreground">
                  Group display name
                </label>
                <p className="text-xs text-muted-foreground">
                  Friends will see this name in private-group standings.
                </p>
                <Input
                  id="display-name"
                  minLength={2}
                  maxLength={40}
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Your name or nickname"
                />
                <Button
                  type="button"
                  className="w-full"
                  disabled={displayName.trim().length < 2 || savingName}
                  onClick={saveDisplayName}
                >
                  {savingName ? "Saving…" : "Save display name"}
                </Button>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
                <label htmlFor="favorite-team" className="text-sm font-bold text-foreground">
                  Your team
                </label>
                <p className="text-xs text-muted-foreground">
                  This team's schedule will open first whenever you sign in.
                </p>
                <select
                  id="favorite-team"
                  value={favoriteTeam}
                  onChange={(event) => setFavoriteTeam(event.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="">Choose your team</option>
                  {TEAM_OPTIONS.map((team) => (
                    <option key={team} value={team}>{team}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  className="w-full"
                  disabled={!favoriteTeam || savingTeam}
                  onClick={saveFavoriteTeam}
                >
                  {savingTeam ? "Saving…" : "Save my team"}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button asChild variant="outline">
                  <Link to="/scorecards">Weekly scorecards</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/groups">Private groups</Link>
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={() => signOut().catch((error) => toast.error(error.message))}
              >
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button className="w-full" onClick={signInWithGoogle}>Continue with Google</Button>
              <div className="text-center text-xs text-muted-foreground">or use a secure email link</div>
              <form className="space-y-3" onSubmit={sendMagicLink}>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button className="w-full" variant="secondary" disabled={submitting}>
                  {submitting ? "Sending…" : "Email me a sign-in link"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
