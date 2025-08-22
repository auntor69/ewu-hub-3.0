import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

type Role = "student" | "faculty" | "admin" | "staff";
type Profile = { user_id: string; role: Role; student_id?: string; faculty_id?: string } | null;

type AuthState = {
  loading: boolean;
  user: User | null;
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
    try {
      setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);

    if (session?.user) {
        const { data, error } = await supabase
        .from("profiles")
          .select("user_id, role, student_id, faculty_id")
        .eq("user_id", session.user.id)
          .single();
        
        if (error) {
          console.error("Error fetching profile:", error);
          setProfile(null);
        } else if (data) {
          setProfile(data as Profile);
        }
    } else {
      setProfile(null);
    }
    } catch (error) {
      console.error("Error in auth load:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      await load();
    });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() { 
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ loading, user, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { return useContext(AuthContext); }