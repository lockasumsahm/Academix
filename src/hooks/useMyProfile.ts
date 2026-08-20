import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface MyProfile {
  id: string;
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
}

/** Current user's public profile row — used for avatars/names in the shell and composers. */
export const useMyProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MyProfile | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setProfile(null);
      return;
    }
    supabase
      .from("profiles")
      .select("id, full_name, headline, avatar_url")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfile((data as MyProfile) ?? null);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return profile;
};
