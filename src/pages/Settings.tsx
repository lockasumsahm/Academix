import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut, Save, Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from "@/components/network/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { ProfessorListingForm } from "@/components/ProfessorListingForm";
import { useSeo } from "@/hooks/useSeo";
import { toast } from "sonner";


const Settings = () => {
  const { user, signOut } = useAuth();
  const { isProfessor } = useRole();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [openToCollab, setOpenToCollab] = useState(true);
  const [messagePrivacy, setMessagePrivacy] = useState<"everyone" | "following">("everyone");

  useSeo("Settings | Academix", "Manage your Academix account, visibility and collaboration preferences.", { noindex: true });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name, open_to_collaboration, message_privacy")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFullName(data?.full_name ?? "");
        setOpenToCollab(data?.open_to_collaboration ?? true);
        setMessagePrivacy((data?.message_privacy as "everyone" | "following") ?? "everyone");
        setLoading(false);
      });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        open_to_collaboration: openToCollab,
        message_privacy: messagePrivacy,
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
      <PageHeader eyebrow="Account" title="Settings" subtitle="Control your account details and how you appear to others." />

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <section className="surface space-y-4 p-5">
            <h2 className="text-sm font-semibold text-primary">Account</h2>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs" htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
            </div>
          </section>

          <section className="surface space-y-4 p-5">
            <h2 className="text-sm font-semibold text-primary">Discovery</h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">Open to collaboration</p>
                <p className="text-xs text-muted-foreground">Show a badge on your profile inviting co-authors.</p>
              </div>
              <Switch checked={openToCollab} onCheckedChange={setOpenToCollab} />
            </div>
          </section>

          <section className="surface space-y-4 p-5">
            <h2 className="text-sm font-semibold text-primary">Messages</h2>
            <p className="text-xs text-muted-foreground">Choose who is allowed to start a conversation with you.</p>
            <div className="space-y-2">
              {[
                { value: "everyone" as const, label: "Anyone on Academix", hint: "Any signed-in researcher can message you." },
                { value: "following" as const, label: "Only people I follow", hint: "New conversations are limited to people you follow." },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMessagePrivacy(opt.value)}
                  className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
                    messagePrivacy === opt.value ? "border-accent bg-secondary/60" : "border-border hover:bg-secondary/40"
                  }`}
                >
                  <span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${messagePrivacy === opt.value ? "border-accent bg-accent" : "border-border"}`} />
                  <span>
                    <span className="block text-sm font-medium text-primary">{opt.label}</span>
                    <span className="block text-xs text-muted-foreground">{opt.hint}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          {isProfessor && <ProfessorListingForm />}

          <section className="surface space-y-3 border-destructive/30 p-5">
            <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
            <p className="text-xs text-muted-foreground">
              Deleting your account permanently removes your profile, posts, publications, uploads and messages. This cannot be undone.
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="rounded-lg gap-1.5">
                  <Trash2 className="h-4 w-4" /> Delete account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your Academix account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This permanently deletes your profile, content and uploaded files. This action cannot be reversed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deleting}
                    onClick={async (e) => {
                      e.preventDefault();
                      setDeleting(true);
                      const { error } = await supabase.functions.invoke("delete-account", { body: {} });
                      setDeleting(false);
                      if (error) {
                        toast.error(error.message || "Could not delete account");
                        return;
                      }
                      await signOut();
                      toast.success("Your account has been deleted");
                      navigate("/");
                    }}
                  >
                    {deleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>







          <div className="flex flex-wrap gap-2">
            <Button className="rounded-lg gap-1.5" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
            </Button>
            <Button
              variant="outline"
              className="rounded-lg gap-1.5"
              onClick={async () => {
                await signOut();
                navigate("/");
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
