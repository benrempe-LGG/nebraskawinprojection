import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Group {
  id: string;
  name: string;
  season: number;
  owner_id: string;
  invite_code: string;
}

interface Leader {
  user_id: string;
  display_name: string;
  role: "owner" | "member";
  weeks_scored: number;
  games_final: number;
  correct_picks: number;
  accuracy: number;
}

export default function Groups() {
  const { user, loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selected, setSelected] = useState<Group | null>(null);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [name, setName] = useState("");
  const [code, setCode] = useState(() => new URLSearchParams(window.location.search).get("code")?.toUpperCase() ?? "");
  const [busy, setBusy] = useState(false);

  const loadGroups = useCallback(async () => {
    if (!user) return;
    const { data, error } = await (supabase as any)
      .from("prediction_groups")
      .select("id, name, season, owner_id, invite_code")
      .order("created_at", { ascending: true });
    if (error) toast.error(error.message);
    else {
      const next = (data ?? []) as Group[];
      setGroups(next);
      setSelected((current) => next.find((group) => group.id === current?.id) ?? next[0] ?? null);
    }
  }, [user]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (!selected) {
      setLeaders([]);
      return;
    }
    (supabase as any)
      .rpc("get_group_leaderboard", { target_group: selected.id })
      .then(({ data, error }: { data: Leader[] | null; error: { message: string } | null }) => {
        if (error) toast.error(error.message);
        else setLeaders(data ?? []);
      });
  }, [selected]);

  async function createGroup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await (supabase as any).rpc("create_private_group", {
      group_name: name,
      target_season: 2026,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setName("");
    toast.success("Private group created.");
    await loadGroups();
  }

  async function joinGroup(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    const { error } = await (supabase as any).rpc("join_private_group", { code });
    setBusy(false);
    if (error) return toast.error(error.message);
    setCode("");
    toast.success("You joined the group.");
    await loadGroups();
  }

  async function copyInvite() {
    if (!selected) return;
    const link = `${window.location.origin}${import.meta.env.BASE_URL}groups?code=${selected.invite_code}`;
    await navigator.clipboard.writeText(link);
    toast.success("Private invite link copied.");
  }

  async function regenerateInvite() {
    if (!selected) return;
    const { error } = await (supabase as any).rpc("regenerate_group_invite", {
      target_group: selected.id,
    });
    if (error) return toast.error(error.message);
    toast.success("A new invite code is ready. The old code no longer works.");
    await loadGroups();
  }

  if (authLoading) return <main className="container py-12">Loading groups…</main>;
  if (!user) {
    const invitePath = code
      ? `/groups?code=${encodeURIComponent(code)}`
      : "/groups";
    sessionStorage.setItem("post_auth_path", invitePath);
    return <Navigate to="/account" replace />;
  }

  return (
    <main className="container max-w-4xl py-12">
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Back to predictor</Link>
      <div className="mt-6 grid gap-6 md:grid-cols-[300px_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a private group</CardTitle>
              <CardDescription>Invite friends to a private 2026 leaderboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={createGroup}>
                <Input required minLength={2} maxLength={60} placeholder="Group name" value={name} onChange={(e) => setName(e.target.value)} />
                <Button className="w-full" disabled={busy}>Create group</Button>
              </form>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Join with a code</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={joinGroup}>
                <Input required placeholder="8-character code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
                <Button className="w-full" variant="secondary" disabled={busy}>Join group</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My groups</CardTitle>
            <CardDescription>Season-long standings update as game results become final.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {groups.length === 0 ? (
              <p className="text-sm text-muted-foreground">Create a group or enter a friend’s invite code to get started.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {groups.map((group) => (
                    <Button key={group.id} size="sm" variant={selected?.id === group.id ? "default" : "outline"} onClick={() => setSelected(group)}>
                      {group.name}
                    </Button>
                  ))}
                </div>
                {selected && (
                  <>
                    <div className="rounded-lg border bg-muted/40 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{selected.name}</p>
                          <p className="text-xs text-muted-foreground">Invite code: <span className="font-mono">{selected.invite_code}</span></p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={copyInvite}>Copy invite</Button>
                          {selected.owner_id === user.id && (
                            <Button size="sm" variant="ghost" onClick={regenerateInvite}>New code</Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="divide-y rounded-lg border">
                      {leaders.map((leader, index) => (
                        <div key={leader.user_id} className="grid grid-cols-[36px_1fr_auto] items-center gap-3 p-4">
                          <span className="text-lg font-bold text-muted-foreground">{index + 1}</span>
                          <div>
                            <p className="font-medium">{leader.display_name}{leader.user_id === user.id ? " (you)" : ""}</p>
                            <p className="text-xs text-muted-foreground">{leader.role === "owner" ? "Commissioner" : `${leader.weeks_scored} weeks scored`}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{leader.correct_picks}/{leader.games_final}</p>
                            <p className="text-xs text-muted-foreground">{leader.accuracy}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
