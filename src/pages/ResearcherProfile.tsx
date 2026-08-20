import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Globe, Github, GraduationCap, Linkedin, Loader2, MapPin, MessageSquare, UserMinus, UserPlus } from "lucide-react";
import { Avatar } from "@/components/network/Avatar";
import { EmptyState } from "@/components/network/EmptyState";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { initialsOf, normalizeUrl, timeAgo } from "@/lib/format";
import { useSignedUrl } from "@/lib/storage";
import { PROFILE_PUBLIC_COLUMNS } from "@/lib/dbColumns";
import { PdfPreviewDialog } from "@/components/publications/PdfPreviewDialog";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { FileSearch } from "lucide-react";

interface Profile {
  id: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  university: string | null;
  major: string | null;
  country: string | null;
  city: string | null;
  education_level: string | null;
  research_interests: string[] | null;
  skills: string[] | null;
  languages: string[] | null;
  website_url: string | null;
  scholar_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  orcid: string | null;
  open_to_collaboration: boolean;
  avatar_url: string | null;
  cover_url: string | null;
}

interface Entry {
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
}

const sections = [
  { kind: "publication", label: "Publications" },
  { kind: "project", label: "Projects" },
  { kind: "experience", label: "Experience" },
  { kind: "education", label: "Education" },
  { kind: "award", label: "Achievements" },
];

const ResearcherProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [posts, setPosts] = useState<{ id: string; title: string | null; body: string; created_at: string }[]>([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const coverUrl = useSignedUrl(profile?.cover_url);
  const [previewEntry, setPreviewEntry] = useState<Entry | null>(null);

  useSeo(
    profile?.full_name ? `${profile.full_name} | Academix` : "Researcher | Academix",
    profile?.headline || "A researcher profile on the Academix research network.",
  );

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const [{ data: p }, { data: e }, { data: po }, { count }] = await Promise.all([
        supabase.from("profiles").select(PROFILE_PUBLIC_COLUMNS).eq("id", id).maybeSingle(),
        supabase.from("profile_entries").select("id, kind, title, organization, description, url, start_date, end_date, file_url, file_name").eq("user_id", id).order("sort_order"),
        supabase.from("posts").select("id, title, body, created_at").eq("author_id", id).order("created_at", { ascending: false }).limit(5),
        supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", id),
      ]);
      setProfile(p as Profile | null);
      setEntries((e ?? []) as Entry[]);
      setPosts(po ?? []);
      setFollowers(count ?? 0);
      if (user) {
        const { data: f } = await supabase.from("follows").select("id").eq("follower_id", user.id).eq("following_id", id).maybeSingle();
        setFollowing(!!f);
      }
      setLoading(false);
    })();
  }, [id, user]);

  const toggleFollow = async () => {
    if (!user) return navigate("/auth");
    if (!id) return;
    if (following) {
      await supabase.from("follows").delete().eq("follower_id", user.id).eq("following_id", id);
      setFollowing(false);
      setFollowers((n) => Math.max(0, n - 1));
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: user.id, following_id: id });
      if (error) return toast.error(error.message);
      setFollowing(true);
      setFollowers((n) => n + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState icon={FileSearch} title="Researcher not found" description="This profile does not exist or is not available." />
      </div>
    );
  }

  const links = [
    { href: normalizeUrl(profile.website_url), icon: Globe, label: "Website" },
    { href: normalizeUrl(profile.scholar_url), icon: GraduationCap, label: "Google Scholar" },
    { href: normalizeUrl(profile.linkedin_url), icon: Linkedin, label: "LinkedIn" },
    { href: normalizeUrl(profile.github_url), icon: Github, label: "GitHub" },
  ].filter((l) => l.href);

  const isSelf = user?.id === profile.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="h-28 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 to-primary/60 sm:h-36">
        {coverUrl ? <img src={coverUrl} alt="" decoding="async" className="h-full w-full object-cover" /> : null}
      </div>
      <div className="-mt-10 px-1 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <div className="rounded-full border-4 border-background">
              <Avatar initials={initialsOf(profile.full_name)} src={profile.avatar_url} size="lg" />
            </div>
            <div className="pb-1">
              <h1 className="text-xl font-semibold tracking-tight text-primary sm:text-2xl">
                {profile.full_name || "Academix researcher"}
              </h1>
              {profile.headline && <p className="text-sm text-muted-foreground">{profile.headline}</p>}
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                {(profile.city || profile.country) && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {[profile.city, profile.country].filter(Boolean).join(", ")}
                  </span>
                )}
                <span>{followers} follower{followers === 1 ? "" : "s"}</span>
                {profile.open_to_collaboration && <span className="text-accent">Open to collaboration</span>}
              </p>
            </div>
          </div>

          {!isSelf && (
            <div className="flex gap-2">
              <Button size="sm" variant={following ? "outline" : "default"} className="rounded-lg" onClick={toggleFollow}>
                {following ? <UserMinus className="mr-1.5 h-3.5 w-3.5" /> : <UserPlus className="mr-1.5 h-3.5 w-3.5" />}
                {following ? "Following" : "Follow"}
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg" onClick={() => navigate(`/messages?to=${profile.id}`)}>
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Message
              </Button>
            </div>
          )}
          {isSelf && (
            <Link to="/profile">
              <Button size="sm" variant="outline" className="rounded-lg">Edit profile</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {profile.bio && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primary">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{profile.bio}</p>
          </section>
        )}

        {(profile.university || profile.major || profile.education_level) && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primary">Institution</h2>
            <p className="mt-2 text-sm text-foreground/80">
              {[profile.university, profile.major, profile.education_level].filter(Boolean).join(" · ")}
            </p>
          </section>
        )}

        {([
          ["Research interests", profile.research_interests],
          ["Skills", profile.skills],
          ["Languages", profile.languages],
        ] as const).map(([label, values]) =>
          values && values.length > 0 ? (
            <section key={label} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-sm font-semibold text-primary">{label}</h2>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {values.map((v) => (
                  <span key={v} className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                    {v}
                  </span>
                ))}
              </div>
            </section>
          ) : null,
        )}

        {sections.map((s) => {
          const items = entries.filter((e) => e.kind === s.kind);
          if (items.length === 0) return null;
          return (
            <section key={s.kind} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <h2 className="text-sm font-semibold text-primary">{s.label}</h2>
              <ul className="mt-3 space-y-4">
                {items.map((e) => (
                  <li key={e.id} className="border-l-2 border-border pl-4">
                    <p className="text-sm font-medium text-primary">{e.title}</p>
                    {e.organization && <p className="text-xs text-muted-foreground">{e.organization}</p>}
                    {(e.start_date || e.end_date) && (
                      <p className="text-[11px] text-muted-foreground">
                        {[e.start_date, e.end_date].filter(Boolean).join(" – ")}
                      </p>
                    )}
                    {e.description && <p className="mt-1 text-sm leading-relaxed text-foreground/75">{e.description}</p>}
                    {normalizeUrl(e.url) && (
                      <a
                        href={normalizeUrl(e.url)!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-block text-xs text-accent hover:underline"
                      >
                        View link
                      </a>
                    )}
                    {e.file_url && (
                      <button
                        type="button"
                        onClick={() => setPreviewEntry(e)}
                        className="mt-2 flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/40 p-2.5 text-left transition-colors hover:border-accent/40"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                          <FileText className="h-4 w-4 text-accent" />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-xs font-medium text-primary">
                            {e.file_name ?? "Attached document"}
                          </span>
                          <span className="block text-[11px] text-muted-foreground">Click to open</span>
                        </span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}

        <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <h2 className="text-sm font-semibold text-primary">Activity</h2>
          {posts.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">No research published yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {posts.map((p) => (
                <li key={p.id} className="border-l-2 border-border pl-4">
                  {p.title && <p className="text-sm font-medium text-primary">{p.title}</p>}
                  <p className="line-clamp-2 text-sm text-foreground/75">{p.body}</p>
                  <p className="text-[11px] text-muted-foreground">{timeAgo(p.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {links.length > 0 && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <h2 className="text-sm font-semibold text-primary">Links</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {links.map((l) => (
                <a key={l.label} href={l.href!} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="outline" className="rounded-lg text-xs">
                    <l.icon className="mr-1.5 h-3.5 w-3.5" /> {l.label}
                  </Button>
                </a>
              ))}
              {profile.orcid && (
                <span className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground">
                  ORCID {profile.orcid}
                </span>
              )}
            </div>
          </section>
        )}
      </div>

      <PdfPreviewDialog
        open={!!previewEntry}
        onOpenChange={(o) => !o && setPreviewEntry(null)}
        title={previewEntry?.title ?? ""}
        fileRef={previewEntry?.file_url ?? null}
        fileName={previewEntry?.file_name ?? null}
        onDownload={() => {}}
      />
    </div>
  );
};

export default ResearcherProfile;
