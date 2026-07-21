import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface WeeklyScorecard {
  ballot_id: string;
  season: number;
  week: number;
  games_final: number;
  correct_picks: number;
  incorrect_picks: number;
}

export default function Scorecards() {
  const { user, loading: authLoading } = useAuth();
  const [rows, setRows] = useState<WeeklyScorecard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    let active = true;
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (supabase as any)
      .from("weekly_scorecards")
      .select("ballot_id, season, week, games_final, correct_picks, incorrect_picks")
      .eq("user_id", user.id)
      .order("week", { ascending: true })
      .then(({ data, error: queryError }: { data: WeeklyScorecard[] | null; error: { message: string } | null }) => {
        if (!active) return;
        setRows(data ?? []);
        setError(queryError?.message ?? null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const totals = useMemo(() => rows.reduce(
    (sum, row) => ({
      final: sum.final + row.games_final,
      correct: sum.correct + row.correct_picks,
    }),
    { final: 0, correct: 0 },
  ), [rows]);

  if (authLoading) return <main className="container py-12">Loading scorecards…</main>;
  if (!user) return <Navigate to="/account" replace />;

  const overallRate = totals.final ? Math.round((totals.correct / totals.final) * 100) : 0;

  return (
    <main className="container max-w-3xl py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to predictor</Link>
      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>2026 weekly scorecards</CardTitle>
            <CardDescription>
              Once your ballot is locked and games become final, this page tracks every pick against the real result.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading results…</p>
            ) : error ? (
              <p className="text-sm text-destructive">Scorecards are not available yet: {error}</p>
            ) : rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scored weeks yet. Your first scorecard will appear after a locked ballot has final game results.
              </p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Season accuracy</p>
                    <p className="text-3xl font-bold">{overallRate}%</p>
                  </div>
                  <p className="text-sm font-medium">{totals.correct} of {totals.final} correct</p>
                </div>
                <Progress value={overallRate} aria-label={`${overallRate}% season accuracy`} />
              </div>
            )}
          </CardContent>
        </Card>

        {rows.map((row) => {
          const rate = row.games_final ? Math.round((row.correct_picks / row.games_final) * 100) : 0;
          return (
            <Card key={`${row.ballot_id}-${row.week}`}>
              <CardContent className="flex items-center gap-5 py-5">
                <div className="min-w-20">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Week</p>
                  <p className="text-2xl font-bold">{row.week}</p>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{row.correct_picks}–{row.incorrect_picks}</span>
                    <span className="font-semibold">{rate}%</span>
                  </div>
                  <Progress value={rate} aria-label={`Week ${row.week}: ${rate}% correct`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
