import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { syncStorageToAuthUser } from "@/lib/accountStorage";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const applySession = (nextSession: Session | null) => {
      if (!active) return;
      const storageChanged = syncStorageToAuthUser(
        localStorage,
        nextSession?.user.id ?? null
      );
      if (storageChanged) {
        window.dispatchEvent(new CustomEvent("account-storage-reset"));
      }
      setSession(nextSession);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      applySession(nextSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(() => ({
    user: session?.user ?? null,
    session,
    loading,
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
  }), [session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
