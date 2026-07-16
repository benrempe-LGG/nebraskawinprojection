import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Account() {
  const { user, loading, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    <main className="container max-w-xl py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to predictor</Link>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{user ? "Your account" : "Save your 2026 ballot"}</CardTitle>
          <CardDescription>
            {user
              ? "Your predictions can be saved across devices and locked for the season."
              : "Sign in to save predictions across devices, lock your ballot, and receive weekly scorecards."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <>
              <p className="text-sm">Signed in as <strong>{user.email}</strong></p>
              <Button asChild className="w-full">
                <Link to="/scorecards">View weekly scorecards</Link>
              </Button>
              <Button asChild className="w-full" variant="secondary">
                <Link to="/groups">Private groups</Link>
              </Button>
              <Button variant="outline" onClick={() => signOut().catch((error) => toast.error(error.message))}>
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
