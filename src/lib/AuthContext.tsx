import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

type Role = "student" | "faculty" | "admin" | "staff";
type Profile = { user_id: string; role: Role } | null;

type AuthState = {
  loading: boolean;
  user: any | null;
  profile: Profile;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  user: null,
  profile: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile>(null);

  async function load() {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    if (session?.user) {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (data) setProfile(data as Profile);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() { await supabase.auth.signOut(); }

  return (
    <AuthContext.Provider value={{ loading, user, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }