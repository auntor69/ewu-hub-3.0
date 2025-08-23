import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

type Role = "student" | "faculty" | "admin" | "staff";
type Profile = { 
  user_id: string; 
  role: Role; 
  student_id?: string; 
  faculty_id?: string;
  created_at?: string;
} | null;

type AuthState = {
  loading: boolean;
  user: User | null;
  profile: Profile;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  loading: true,
  user: null,
  profile: null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);

  async function loadUserAndProfile() {
    try {
      setLoading(true);
      
      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("user_id, role, student_id, faculty_id, created_at")
          .eq("user_id", session.user.id)
          .single();
        
        if (profileError) {
          console.error("Profile fetch error:", profileError);
          setProfile(null);
        } else {
          setProfile(profileData as Profile);
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Auth load error:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function refreshProfile() {
    if (!user) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("user_id, role, student_id, faculty_id, created_at")
        .eq("user_id", user.id)
        .single();
      
      if (error) {
        console.error("Profile refresh error:", error);
      } else {
        setProfile(profileData as Profile);
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
    }
  }

  useEffect(() => {
    loadUserAndProfile();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setProfile(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await loadUserAndProfile();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function signOut() {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }

  return (
    <AuthContext.Provider value={{ loading, user, profile, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() { 
  return useContext(AuthContext); 
}