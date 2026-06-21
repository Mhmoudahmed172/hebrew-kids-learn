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
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => {
          supabase.from("user_roles").select("role").eq("user_id", s.user.id)
            .then(({ data }) => setRoles((data ?? []).map((r: any) => r.role)));
        }, 0);
        if (s.access_token) {
          document.cookie = `sb-access-token=${s.access_token}; path=/; max-age=${s.expires_in}; SameSite=Lax`;
        }
        if (s.refresh_token) {
          document.cookie = `sb-refresh-token=${s.refresh_token}; path=/; max-age=${s.expires_in}; SameSite=Lax`;
        }
      } else {
        setRoles([]);
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        supabase.from("user_roles").select("role").eq("user_id", s.user.id)
          .then(({ data }) => setRoles((data ?? []).map((r: any) => r.role)));
        if (s.access_token) {
          document.cookie = `sb-access-token=${s.access_token}; path=/; max-age=${s.expires_in}; SameSite=Lax`;
        }
        if (s.refresh_token) {
          document.cookie = `sb-refresh-token=${s.refresh_token}; path=/; max-age=${s.expires_in}; SameSite=Lax`;
        }
      } else {
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
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
