import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, type UserProfile } from "@/services/supabase";
import { api } from "@/services/api";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, profile, loading, role: profile?.role ?? null };
}

async function fetchProfile(_userId: string): Promise<UserProfile | null> {
  try {
    const data = await api.get<UserProfile>("/auth/profile");
    return data;
  } catch {
    return null;
  }
}
