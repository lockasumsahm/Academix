import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/network/EmptyState";
import { PageHeader } from "@/components/network/PageHeader";
import { PdfPreviewDialog } from "@/components/publications/PdfPreviewDialog";
import { PublicationCard, type EntryComment, type PubEntry } from "@/components/publications/PublicationCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { getSignedUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";

const tabs = ["All", "Publications", "Projects", "Saved"] as const;
type Tab = (typeof tabs)[number];

const ENTRY_COLUMNS =
  "id, user_id, kind, title, organization, description, url, start_date, file_url, file_name, view_count, download_count, created_at";

const Publications = () => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<PubEntry[]>([]);
  const [authors, setAuthors] = useState<Record<string, string>>({});
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [myLikes, setMyLikes] = useState<Set<string>>(new Set());
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, EntryComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("All");
  const [q, setQ] = useState("");
  const [preview, setPreview] = useState<PubEntry | null>(null);

  useSeo(
    "Publications & Projects | Academix",
    "Browse research publications, preprints and projects shared by student researchers on Academix.",
    { noindex: true },
  );

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profile_entries")
        .select(ENTRY_COLUMNS)
        .in("kind", ["publication", "project"])
        .order("created_at", { ascending: false })
        .limit(120);
      if (!active) return;
      if (error) {
        toast.error("Could not load the research library");
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as PubEntry[];
      setEntries(rows);
      const ids = rows.map((r) => r.id);
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));

      const [profs, likeRows, commentRows, bookmarkRows] = await Promise.all([
        userIds.length
          ? supabase.from("profiles").select("id, full_name").in("id", userIds)
          : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
        ids.length
          ? supabase.from("entry_likes").select("entry_id, user_id").in("entry_id", ids)
          : Promise.resolve({ data: [] as { entry_id: string; user_id: string }[] }),
        ids.length
          ? supabase.from("entry_comments").select("entry_id").in("entry_id", ids)
          : Promise.resolve({ data: [] as { entry_id: string }[] }),
        user && ids.length
          ? supabase.from("entry_bookmarks").select("entry_id").in("entry_id", ids)
          : Promise.resolve({ data: [] as { entry_id: string }[] }),
      ]);
      if (!active) return;

      setAuthors(Object.fromEntries((profs.data ?? []).map((p) => [p.id, p.full_name ?? "Researcher"])));

      const likeCounts: Record<string, number> = {};
      const mine = new Set<string>();
      for (const l of likeRows.data ?? []) {
        likeCounts[l.entry_id] = (likeCounts[l.entry_id] ?? 0) + 1;
        if (l.user_id === user?.id) mine.add(l.entry_id);
      }
      setLikes(likeCounts);
      setMyLikes(mine);

      const cCounts: Record<string, number> = {};
      for (const c of commentRows.data ?? []) cCounts[c.entry_id] = (cCounts[c.entry_id] ?? 0) + 1;
      setCommentCounts(cCounts);

      setBookmarks(new Set((bookmarkRows.data ?? []).map((b) => b.entry_id)));
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return entries
      .filter((e) =>
        tab === "All"
          ? true
          : tab === "Saved"
            ? bookmarks.has(e.id)
            : tab === "Publications"
              ? e.kind === "publication"
              : e.kind === "project",
      )
      .filter((e) =>
        term
          ? [e.title, e.organization, e.description, authors[e.user_id]]
              .filter(Boolean)
              .some((v) => String(v).toLowerCase().includes(term))
          : true,
      );
  }, [entries, tab, q, bookmarks, authors]);

  const toggleLike = async (id: string) => {
    if (!user) return;
    const liked = myLikes.has(id);
    setMyLikes((prev) => {
      const next = new Set(prev);
      liked ? next.delete(id) : next.add(id);
      return next;
    });
    setLikes((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + (liked ? -1 : 1)) }));
    const { error } = liked
      ? await supabase.from("entry_likes").delete().eq("entry_id", id).eq("user_id", user.id)
      : await supabase.from("entry_likes").insert({ entry_id: id, user_id: user.id });
    if (error) {
      toast.error("Could not update your like");
      setMyLikes((prev) => {
        const next = new Set(prev);
        liked ? next.add(id) : next.delete(id);
        return next;
      });
      setLikes((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + (liked ? 1 : -1)) }));
    }
  };

  const toggleBookmark = async (id: string) => {
    if (!user) return;
    const saved = bookmarks.has(id);
    setBookmarks((prev) => {
      const next = new Set(prev);
      saved ? next.delete(id) : next.add(id);
      return next;
    });
    const { error } = saved
      ? await supabase.from("entry_bookmarks").delete().eq("entry_id", id).eq("user_id", user.id)
      : await supabase.from("entry_bookmarks").insert({ entry_id: id, user_id: user.id });
    if (error) {
      toast.error("Could not update your bookmark");
      setBookmarks((prev) => {
        const next = new Set(prev);
        saved ? next.add(id) : next.delete(id);
        return next;
      });
    } else {
      toast.success(saved ? "Removed from saved" : "Saved to your library");
    }
  };

  const loadComments = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from("entry_comments")
      .select("id, user_id, body, created_at")
      .eq("entry_id", id)
      .order("created_at", { ascending: true });
    if (error) {
      toast.error("Could not load comments");
      return;
    }
    const rows = (data ?? []) as EntryComment[];
    setComments((prev) => ({ ...prev, [id]: rows }));
    setCommentCounts((prev) => ({ ...prev, [id]: rows.length }));
    const missing = Array.from(new Set(rows.map((r) => r.user_id)));
    if (missing.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", missing);
      if (profs) {
        setAuthors((prev) => ({
          ...prev,
          ...Object.fromEntries(profs.map((p) => [p.id, p.full_name ?? "Researcher"])),
        }));
      }
    }
  }, []);

  const addComment = async (id: string, body: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("entry_comments")
      .insert({ entry_id: id, user_id: user.id, body })
      .select("id, user_id, body, created_at")
      .single();
    if (error || !data) {
      toast.error("Could not post your comment");
      return;
    }
    setComments((prev) => ({ ...prev, [id]: [...(prev[id] ?? []), data as EntryComment] }));
    setCommentCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  };

  const openPreview = async (entry: PubEntry) => {
    setPreview(entry);
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, view_count: e.view_count + 1 } : e)));
    await supabase.functions.invoke("entries", { body: { action: "view", entry_id: entry.id } });
  };

  const countDownload = (entry: PubEntry) => {
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, download_count: e.download_count + 1 } : e)));
    void supabase.functions.invoke("entries", { body: { action: "download", entry_id: entry.id } });
  };

  const download = async (entry: PubEntry) => {
    if (!entry.file_url) return;
    const url = await getSignedUrl(entry.file_url);
    if (!url) {
      toast.error("This file is no longer available");
      return;
    }
    countDownload(entry);
    const a = document.createElement("a");
    a.href = url;
    a.download = entry.file_name ?? "document.pdf";
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Research library"
        title="Publications & Projects"
        subtitle="Everything published by the Academix community, newest first."
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, authors and abstracts"
            className="pl-9"
          />
        </div>
        <div className="flex gap-4 text-xs font-medium">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "pb-1.5 transition-colors",
                tab === t ? "border-b-2 border-accent text-accent" : "text-muted-foreground hover:text-primary",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="surface h-40 animate-pulse rounded-2xl bg-muted/40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={tab === "Saved" ? "Nothing saved yet" : "Nothing published yet"}
          description={
            tab === "Saved"
              ? "Bookmark publications and projects to build your reading list."
              : "Add publications and projects from your profile to see them here."
          }
          action={
            <Link to="/profile">
              <Button size="sm" className="rounded-lg">Go to my profile</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((e) => (
            <PublicationCard
              key={e.id}
              entry={e}
              authorName={authors[e.user_id] ?? "Researcher"}
              liked={myLikes.has(e.id)}
              likeCount={likes[e.id] ?? 0}
              bookmarked={bookmarks.has(e.id)}
              commentCount={commentCounts[e.id] ?? 0}
              comments={comments[e.id]}
              authorsById={authors}
              onToggleLike={toggleLike}
              onToggleBookmark={toggleBookmark}
              onLoadComments={loadComments}
              onComment={addComment}
              onPreview={openPreview}
              onDownload={download}
            />
          ))}
        </div>
      )}

      <PdfPreviewDialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
        title={preview?.title ?? ""}
        fileRef={preview?.file_url ?? null}
        fileName={preview?.file_name ?? null}
        onDownload={() => preview && countDownload(preview)}
      />
    </div>
  );
};

export default Publications;
