import { useEffect, useState } from "react";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

export const FollowButton = ({
  targetId,
  size = "sm",
  onChange,
}: {
  targetId: string;
  size?: "sm" | "default";
  onChange?: (following: boolean) => void;
}) => {
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user || user.id === targetId) {
      setReady(true);
      return;
    }
    supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", targetId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setFollowing(Boolean(data));
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, [user, targetId]);

  if (!user || user.id === targetId) return null;

  const toggle = async () => {
    setBusy(true);
    if (following) {
      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetId);
      if (error) toast({ title: "Could not unfollow", description: error.message, variant: "destructive" });
      else {
        setFollowing(false);
        onChange?.(false);
      }
    } else {
      const { error } = await supabase
        .from("follows")
        .insert({ follower_id: user.id, following_id: targetId });
      if (error) toast({ title: "Could not follow", description: error.message, variant: "destructive" });
      else {
        setFollowing(true);
        onChange?.(true);
      }
    }
    setBusy(false);
  };

  return (
    <Button
      size={size}
      variant={following ? "outline" : "default"}
      className="rounded-lg gap-1.5"
      disabled={busy || !ready}
      onClick={toggle}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : following ? (
        <UserCheck className="h-3.5 w-3.5" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
};
