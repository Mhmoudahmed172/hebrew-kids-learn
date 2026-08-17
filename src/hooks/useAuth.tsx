import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type Role = "admin" | "parent" | "kid";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: Role[];
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null, session: null, loading: true, roles: [], isAdmin: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchRoles = (userId: string) => {
      supabase.from("user_roles").select("role").eq("user_id", userId)
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.error("[auth] failed to load roles:", error.message);
            setRoles([]);
            return;
          }
          setRoles((data ?? []).map((r) => r.role as Role));
        });
    };

    const applySession = (s: Session | null, deferRoles: boolean) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const uid = s.user.id;
        if (deferRoles) setTimeout(() => fetchRoles(uid), 0);
        else fetchRoles(uid);
      } else {
        setRoles([]);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => applySession(s, true));

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      applySession(s, false);
      setLoading(false);
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, []);

  return (
    <Ctx.Provider value={{
      user, session, loading, roles,
      isAdmin: roles.includes("admin"),
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
