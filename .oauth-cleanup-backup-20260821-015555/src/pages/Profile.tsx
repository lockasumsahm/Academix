import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { normalizeUrl } from "@/lib/format";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { PROFILE_PUBLIC_COLUMNS } from "@/lib/dbColumns";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/network/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Plus, Trash2, ExternalLink, Pencil, Camera, Upload, FileText } from "lucide-react";
import { uploadUserFile, useSignedUrl, getSignedUrl } from "@/lib/storage";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  headline: string | null;
  bio: string | null;
  university: string | null;
  major: string | null;
  country: string | null;
  city: string | null;
  education_level: string | null;
  graduation_year: number | null;
  research_interests: string[] | null;
  skills: string[] | null;
  languages: string[] | null;
  website_url: string | null;
  scholar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  orcid: string | null;
  open_to_collaboration: boolean | null;
  avatar_url: string | null;
  cover_url: string | null;
};

type Entry = {
  id: string;
  kind: string;
  title: string;
  organization: string | null;
  description: string | null;
  url: string | null;
  start_date: string | null;
  end_date: string | null;
  file_url: string | null;
  file_name: string | null;
};

const SECTIONS = [
  { kind: "publication", label: "Publications", empty: "Add papers, preprints and posters." },
  { kind: "experience", label: "Experience", empty: "Research assistantships, internships, labs." },
  { kind: "education", label: "Education", empty: "Schools, programmes and courses." },
  { kind: "award", label: "Awards", empty: "Competitions, honours and scholarships." },
  { kind: "project", label: "Projects", empty: "Independent research and side projects." },
] as const;

const list = (v: string) => v.split(",").map((s) => s.trim()).filter(Boolean);
const initialsOf = (name?: string | null, email?: string | null) => {
  const src = (name || email || "A").trim();
  const parts = src.split(/[\s@.]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "A") + (parts[1]?.[0] ?? "")).toUpperCase();
};

const emptyEntry = {
  kind: "publication", title: "", organization: "", description: "", url: "",
  start_date: "", end_date: "", file_url: "", file_name: "",
};

const ProfilePage = () => {
  useSeo("Your Research Profile | Academix", "Build a complete research profile: publications, experience, education, awards, skills and collaboration status.", { noindex: true });
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryForm, setEntryForm] = useState<typeof emptyEntry & { id?: string }>(emptyEntry);
  const [uploading, setUploading] = useState<null | "avatar" | "cover" | "file">(null);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const coverUrl = useSignedUrl(profile?.cover_url);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const [{ data: p }, entriesRes] = await Promise.all([
        supabase.from("profiles").select(PROFILE_PUBLIC_COLUMNS).eq("id", user.id).maybeSingle(),
        // Owner-only view of entries, including private attached files.
        supabase.functions.invoke("entries", { body: { action: "mine" } }),
      ]);
      if (!active) return;
      setProfile(p ? ({ ...p, email: user.email ?? null } as unknown as Profile) : null);
      const e = (entriesRes.data as { entries?: Entry[] } | null)?.entries ?? [];
      setEntries(e.slice().reverse());
      setLoading(false);
      const [{ count: followers }, { count: following }] = await Promise.all([
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", user.id),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", user.id),
      ]);
      if (active) setCounts({ followers: followers ?? 0, following: following ?? 0 });
      if (params.get("setup") === "1") {
        openEdit(p ? ({ ...p, email: user.email ?? null } as unknown as Profile) : null);
        params.delete("setup");
        setParams(params, { replace: true });
      }
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const completion = useMemo(() => {
    if (!profile) return 0;
    const checks = [
      profile.full_name, profile.headline, profile.bio, profile.university, profile.major,
      profile.country, profile.education_level,
      profile.research_interests?.length, profile.skills?.length,
      entries.length,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [profile, entries]);

  const openEdit = (p: Profile | null) => {
    setForm({
      full_name: p?.full_name ?? "",
      headline: p?.headline ?? "",
      bio: p?.bio ?? "",
      university: p?.university ?? "",
      major: p?.major ?? "",
      country: p?.country ?? "",
      city: p?.city ?? "",
      education_level: p?.education_level ?? "",
      graduation_year: p?.graduation_year ? String(p.graduation_year) : "",
      research_interests: (p?.research_interests ?? []).join(", "),
      skills: (p?.skills ?? []).join(", "),
      languages: (p?.languages ?? []).join(", "),
      website_url: p?.website_url ?? "",
      scholar_url: p?.scholar_url ?? "",
      linkedin_url: p?.linkedin_url ?? "",
      github_url: p?.github_url ?? "",
      orcid: p?.orcid ?? "",
      open_to_collaboration: p?.open_to_collaboration ?? true,
    });
    setEditOpen(true);
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const payload = {
      full_name: String(form.full_name || ""),
      headline: String(form.headline || ""),
      bio: String(form.bio || ""),
      university: String(form.university || ""),
      major: String(form.major || ""),
      country: String(form.country || ""),
      city: String(form.city || ""),
      education_level: String(form.education_level || ""),
      graduation_year: form.graduation_year ? Number(form.graduation_year) : null,
      research_interests: list(String(form.research_interests || "")),
      skills: list(String(form.skills || "")),
      languages: list(String(form.languages || "")),
      website_url: normalizeUrl(String(form.website_url || "")) ?? "",
      scholar_url: normalizeUrl(String(form.scholar_url || "")) ?? "",
      linkedin_url: normalizeUrl(String(form.linkedin_url || "")) ?? "",
      github_url: normalizeUrl(String(form.github_url || "")) ?? "",
      orcid: String(form.orcid || ""),
      open_to_collaboration: Boolean(form.open_to_collaboration),
      profile_completed: true,
      updated_at: new Date().toISOString(),
    };
    // Update first (the profile row is created on sign-up); insert only if missing.
    let { data, error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select(PROFILE_PUBLIC_COLUMNS)
      .maybeSingle();
    if (!error && !data) {
      ({ data, error } = await supabase
        .from("profiles")
        .insert({ id: user.id, email: user.email, ...payload })
        .select(PROFILE_PUBLIC_COLUMNS)
        .maybeSingle());
    }
    setSaving(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    setProfile(data ? ({ ...data, email: user.email ?? null } as unknown as Profile) : null);

    setEditOpen(false);
    toast({ title: "Profile updated" });
  };

  const saveEntry = async () => {
    if (!user || !entryForm.title.trim()) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      kind: entryForm.kind,
      title: entryForm.title,
      organization: entryForm.organization || null,
      description: entryForm.description || null,
      url: entryForm.url || null,
      start_date: entryForm.start_date || null,
      end_date: entryForm.end_date || null,
      file_url: entryForm.file_url || null,
      file_name: entryForm.file_name || null,
    };
    const query = entryForm.id
      ? supabase.from("profile_entries").update(payload).eq("id", entryForm.id).select().maybeSingle()
      : supabase.from("profile_entries").insert(payload).select().maybeSingle();
    const { data, error } = await query;
    setSaving(false);
    if (error) {
      toast({ title: "Could not save entry", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => {
      const rest = prev.filter((x) => x.id !== (data as Entry).id);
      return [data as Entry, ...rest];
    });
    setEntryOpen(false);
    setEntryForm(emptyEntry);
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from("profile_entries").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const uploadImage = async (kind: "avatar" | "cover", file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Images only", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Image must be under 5 MB", variant: "destructive" });
      return;
    }
    setUploading(kind);
    try {
      const ref = await uploadUserFile(kind === "avatar" ? "avatars" : "covers", user.id, file);
      const column = kind === "avatar" ? "avatar_url" : "cover_url";
      const { error } = await supabase.from("profiles").update({ [column]: ref }).eq("id", user.id);
      if (error) throw error;
      setProfile((prev) => (prev ? { ...prev, [column]: ref } : prev));
      toast({ title: kind === "avatar" ? "Photo updated" : "Cover updated" });
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const uploadEntryFile = async (file: File) => {
    if (!user) return;
    if (file.size > 20 * 1024 * 1024) {
      toast({ title: "File must be under 20 MB", variant: "destructive" });
      return;
    }
    setUploading("file");
    try {
      const ref = await uploadUserFile("publications", user.id, file);
      setEntryForm((prev) => ({ ...prev, file_url: ref, file_name: file.name }));
    } catch (err) {
      toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const openEntryFile = async (ref: string) => {
    const url = await getSignedUrl(ref);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const name = profile?.full_name || user?.email?.split("@")[0] || "Your name";
  const links = [
    { label: "Website", url: normalizeUrl(profile?.website_url) },
    { label: "Google Scholar", url: normalizeUrl(profile?.scholar_url) },
    { label: "LinkedIn", url: normalizeUrl(profile?.linkedin_url) },
    { label: "GitHub", url: normalizeUrl(profile?.github_url) },
  ].filter((l) => l.url);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
      {completion < 100 && (
        <div className="mb-6 rounded-xl border border-border bg-secondary/40 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-primary">Profile strength — {completion}%</p>
              <p className="text-xs text-muted-foreground">Complete profiles get matched with more professors and opportunities.</p>
            </div>
            <Button size="sm" onClick={() => openEdit(profile)}>Complete profile</Button>
          </div>
          <Progress value={completion} className="mt-3 h-1.5" />
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card shadow-soft overflow-hidden">
        <div className="relative h-36 sm:h-52 bg-gradient-to-br from-hero-from via-hero-from to-hero-to">
          {coverUrl && <img src={coverUrl} alt="" decoding="async" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          <label className="absolute right-3 top-3 inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-[11px] font-medium text-primary shadow-soft backdrop-blur transition hover:bg-card">
            {uploading === "cover" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {coverUrl ? "Change cover" : "Add cover"}
            <input type="file" accept="image/*" className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("cover", f); e.currentTarget.value = ""; }} />
          </label>
        </div>
        <div className="px-5 sm:px-7 pb-6">
          <div className="-mt-12 sm:-mt-14 flex items-end justify-between gap-4">
            <div className="relative w-fit rounded-full ring-4 ring-card shadow-soft">
              <Avatar initials={initialsOf(profile?.full_name, user?.email)} src={profile?.avatar_url} verified={completion >= 80} size="lg" />
              <label className="absolute -bottom-1 -right-1 inline-flex cursor-pointer items-center justify-center rounded-full border border-border bg-card p-1.5 shadow-soft hover:bg-secondary">
                {uploading === "avatar" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5 text-primary" />}
                <span className="sr-only">Upload profile photo</span>
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage("avatar", f); e.currentTarget.value = ""; }} />
              </label>
            </div>
            <Button size="sm" variant="outline" className="h-9 shrink-0 rounded-lg px-4 text-xs" onClick={() => openEdit(profile)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit profile
            </Button>
          </div>

          <div className="mt-4 min-w-0">
            <h1 className="serif text-2xl sm:text-3xl font-semibold tracking-tight text-primary break-words">{name}</h1>
            <p className="mt-1 text-sm text-foreground/70 break-words">
              {profile?.headline || "Add a headline to describe your research focus"}
            </p>
            {!![profile?.major, profile?.university, profile?.city, profile?.country].filter(Boolean).length && (
              <p className="mt-1 text-xs text-muted-foreground">
                {[profile?.major, profile?.university, [profile?.city, profile?.country].filter(Boolean).join(", ")]
                  .filter(Boolean).join(" · ")}
              </p>
            )}
          </div>


          {profile?.bio && (
            <p className="mt-5 text-sm leading-relaxed text-foreground/80 max-w-2xl whitespace-pre-line">{profile.bio}</p>
          )}

          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Publications", value: entries.filter((e) => e.kind === "publication").length },
              { label: "Experience", value: entries.filter((e) => e.kind === "experience").length },
              { label: "Followers", value: counts.followers },
              { label: "Following", value: counts.following },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-secondary/40 p-3.5">
                <p className="text-lg font-semibold text-primary tabular-nums">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {!!profile?.research_interests?.length && (
            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Research interests</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.research_interests.map((s) => (
                  <span key={s} className="rounded-md bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary">{s}</span>
                ))}
              </div>
            </div>
          )}

          {!!profile?.skills?.length && (
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Skills</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {profile.skills.map((s) => (
                  <span key={s} className="rounded-md bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">{s}</span>
                ))}
              </div>
            </div>
          )}

          {!!links.length && (
            <div className="mt-4 flex flex-wrap gap-3">
              {links.map((l) => (
                <a key={l.label} href={l.url!} target="_blank" rel="noreferrer noopener"
                   className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  {l.label} <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sections */}
      <section className="mt-8">
        <Tabs defaultValue={SECTIONS[0].kind}>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <TabsList className="flex-wrap h-auto">
              {SECTIONS.map((s) => (
                <TabsTrigger key={s.kind} value={s.kind} className="text-xs">
                  {s.label}
                  <span className="ml-1.5 text-[10px] text-muted-foreground">
                    {entries.filter((e) => e.kind === s.kind).length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {SECTIONS.map((s) => (
            <TabsContent key={s.kind} value={s.kind} className="mt-4">
              <div className="flex justify-end">
                <Dialog open={entryOpen} onOpenChange={(o) => { setEntryOpen(o); if (!o) setEntryForm(emptyEntry); }}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="h-8 text-xs"
                            onClick={() => setEntryForm({ ...emptyEntry, kind: s.kind })}>
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add {s.label.replace(/s$/, "")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-lg flex-col gap-4 overflow-hidden p-4 sm:p-6">
                    <DialogHeader className="shrink-0 pr-8 text-left">
                      <DialogTitle>{entryForm.id ? "Edit entry" : "Add entry"}</DialogTitle>
                      <DialogDescription>Everything you add strengthens your Research Journey.</DialogDescription>
                    </DialogHeader>
                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                      <div className="space-y-1.5">
                        <Label>Title</Label>
                        <Input value={entryForm.title} onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Organisation / venue</Label>
                        <Input value={entryForm.organization} onChange={(e) => setEntryForm({ ...entryForm, organization: e.target.value })} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <Label>Start</Label>
                          <Input placeholder="Jan 2025" value={entryForm.start_date} onChange={(e) => setEntryForm({ ...entryForm, start_date: e.target.value })} />
                        </div>
                        <div className="space-y-1.5">
                          <Label>End</Label>
                          <Input placeholder="Present" value={entryForm.end_date} onChange={(e) => setEntryForm({ ...entryForm, end_date: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label>Link</Label>
                        <Input placeholder="https://" value={entryForm.url} onChange={(e) => setEntryForm({ ...entryForm, url: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Description</Label>
                        <Textarea rows={4} value={entryForm.description} onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })} />
                      </div>
                      <div className="space-y-1.5">
                        <Label>PDF or file</Label>
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-xs text-muted-foreground hover:border-accent hover:text-primary">
                          {uploading === "file" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                          {entryForm.file_name || "Upload a PDF, poster or dataset (max 20 MB)"}
                          <input type="file" className="sr-only"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadEntryFile(f); e.currentTarget.value = ""; }} />
                        </label>
                      </div>
                    </div>
                    <DialogFooter className="shrink-0 gap-2 sm:gap-2">
                      <Button variant="outline" onClick={() => { setEntryOpen(false); setEntryForm(emptyEntry); }}>
                        Cancel
                      </Button>
                      <Button onClick={saveEntry} disabled={saving || !entryForm.title.trim()}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-3 space-y-3">
                {entries.filter((e) => e.kind === s.kind).length === 0 && (
                  <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    {s.empty}
                  </p>
                )}
                {entries.filter((e) => e.kind === s.kind).map((e) => (
                  <div key={e.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-primary break-words">{e.title}</h3>
                        <p className="text-xs text-muted-foreground">
                          {[e.organization, [e.start_date, e.end_date].filter(Boolean).join(" – ")].filter(Boolean).join(" · ")}
                        </p>
                        {e.description && <p className="mt-2 text-sm text-foreground/80 whitespace-pre-line">{e.description}</p>}
                        {e.file_url && (
                          <button type="button" onClick={() => openEntryFile(e.file_url!)}
                            className="mt-2 mr-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                            <FileText className="h-3 w-3" /> {e.file_name || "Open file"}
                          </button>
                        )}
                        {normalizeUrl(e.url) && (
                          <a href={normalizeUrl(e.url)!} target="_blank" rel="noreferrer noopener"
                             className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8"
                                onClick={() => { setEntryForm({ id: e.id, kind: e.kind, title: e.title, organization: e.organization ?? "", description: e.description ?? "", url: e.url ?? "", start_date: e.start_date ?? "", end_date: e.end_date ?? "", file_url: e.file_url ?? "", file_name: e.file_name ?? "" }); setEntryOpen(true); }}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteEntry(e.id)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="flex max-h-[90dvh] w-[calc(100vw-1.5rem)] max-w-2xl flex-col gap-4 overflow-hidden p-4 sm:p-6">
          <DialogHeader className="shrink-0 text-left">
            <DialogTitle>Edit your profile</DialogTitle>
            <DialogDescription>This is what professors and collaborators see.</DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Full name</Label>
                <Input value={String(form.full_name ?? "")} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Headline</Label>
                <Input placeholder="Pre-university researcher · Machine Learning" value={String(form.headline ?? "")} onChange={(e) => setForm({ ...form, headline: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>About</Label>
              <Textarea rows={4} value={String(form.bio ?? "")} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Institution</Label>
                <Input value={String(form.university ?? "")} onChange={(e) => setForm({ ...form, university: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Field / major</Label>
                <Input value={String(form.major ?? "")} onChange={(e) => setForm({ ...form, major: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Education level</Label>
                <Input placeholder="High school, Undergraduate…" value={String(form.education_level ?? "")} onChange={(e) => setForm({ ...form, education_level: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Graduation year</Label>
                <Input type="number" value={String(form.graduation_year ?? "")} onChange={(e) => setForm({ ...form, graduation_year: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>City</Label>
                <Input value={String(form.city ?? "")} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Country</Label>
                <Input value={String(form.country ?? "")} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Research interests (comma separated)</Label>
              <Input value={String(form.research_interests ?? "")} onChange={(e) => setForm({ ...form, research_interests: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Skills (comma separated)</Label>
              <Input value={String(form.skills ?? "")} onChange={(e) => setForm({ ...form, skills: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Languages (comma separated)</Label>
              <Input value={String(form.languages ?? "")} onChange={(e) => setForm({ ...form, languages: e.target.value })} /></div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Website</Label>
                <Input placeholder="https://" value={String(form.website_url ?? "")} onChange={(e) => setForm({ ...form, website_url: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Google Scholar</Label>
                <Input placeholder="https://" value={String(form.scholar_url ?? "")} onChange={(e) => setForm({ ...form, scholar_url: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>LinkedIn</Label>
                <Input placeholder="https://" value={String(form.linkedin_url ?? "")} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>GitHub</Label>
                <Input placeholder="https://" value={String(form.github_url ?? "")} onChange={(e) => setForm({ ...form, github_url: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>ORCID</Label>
                <Input value={String(form.orcid ?? "")} onChange={(e) => setForm({ ...form, orcid: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3.5">
              <div>
                <p className="text-sm font-medium text-primary">Open to collaboration</p>
                <p className="text-xs text-muted-foreground">Show a badge and appear in collaborator searches.</p>
              </div>
              <Switch checked={Boolean(form.open_to_collaboration)} onCheckedChange={(v) => setForm({ ...form, open_to_collaboration: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveProfile} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;
