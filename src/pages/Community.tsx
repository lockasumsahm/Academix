import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FileSearch, Loader2, TrendingUp, Users } from "lucide-react";
import { PostCard, type FeedPostRow, type PostAuthor, type PostComment } from "@/components/network/PostCard";
import { EmptyState } from "@/components/network/EmptyState";
import { Avatar } from "@/components/network/Avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { initialsOf } from "@/lib/format";
import { useMyProfile } from "@/hooks/useMyProfile";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const postTypes = ["update", "publication", "collaboration", "question", "opportunity", "milestone"];
const filters = ["All", "Publications", "Collaborations", "Questions", "Opportunities"] as const;
const filterToType: Record<string, string | null> = {
  All: null,
  Publications: "publication",
  Collaborations: "collaboration",
  Questions: "question",
  Opportunities: "opportunity",
};

const PAGE_SIZE = 10;

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPostRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, PostAuthor>>({});
  const [reactions, setReactions] = useState<Record<string, Record<string, number>>>({});
  const [mine, setMine] = useState<Record<string, string[]>>({});
  const [comments, setComments] = useState<Record<string, PostComment[]>>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [done, setDone] = useState(false);
  const [active, setActive] = useState<(typeof filters)[number]>("All");
  const me = useMyProfile();
  const [suggested, setSuggested] = useState<PostAuthor[]>([]);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState("update");
  const [tags, setTags] = useState("");
  const [posting, setPosting] = useState(false);

  useSeo(
    "Community Feed | Academix Research Network",
    "A research feed of publications, collaboration calls, lab openings and open questions from student researchers and professors worldwide.",
    { noindex: true },
  );

  const hydrateAuthors = useCallback(async (ids: string[]) => {
    const missing = Array.from(new Set(ids));
    if (missing.length === 0) return;
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, headline, university, country, major, avatar_url")
      .in("id", missing);
    if (data) setAuthors((prev) => ({ ...prev, ...Object.fromEntries(data.map((p) => [p.id, p as PostAuthor])) }));
  }, []);

  const hydrateReactions = useCallback(
    async (postIds: string[]) => {
      if (postIds.length === 0) return;
      const { data } = await supabase.from("post_reactions").select("post_id, kind, user_id").in("post_id", postIds);
      if (!data) return;
      const counts: Record<string, Record<string, number>> = {};
      const own: Record<string, string[]> = {};
      for (const r of data) {
        counts[r.post_id] = counts[r.post_id] ?? {};
        counts[r.post_id][r.kind] = (counts[r.post_id][r.kind] ?? 0) + 1;
        if (user && r.user_id === user.id) own[r.post_id] = [...(own[r.post_id] ?? []), r.kind];
      }
      setReactions((prev) => ({ ...prev, ...counts }));
      setMine((prev) => ({ ...prev, ...own }));
    },
    [user],
  );

  const fetchPage = useCallback(
    async (offset: number, replace: boolean) => {
      const type = filterToType[active];
      let query = supabase
        .from("posts")
        .select(
          "id, author_id, type, title, body, tags, visibility, attachment_kind, attachment_label, attachment_meta, comment_count, created_at",
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1);
      if (type) query = query.eq("type", type);

      const { data, error } = await query;
      if (error) {
        toast.error("Could not load the feed");
        return;
      }
      const rows = (data ?? []) as FeedPostRow[];
      setDone(rows.length < PAGE_SIZE);
      setPosts((prev) => (replace ? rows : [...prev, ...rows]));
      await Promise.all([hydrateAuthors(rows.map((r) => r.author_id)), hydrateReactions(rows.map((r) => r.id))]);
    },
    [active, hydrateAuthors, hydrateReactions],
  );

  useEffect(() => {
    setLoading(true);
    fetchPage(0, true).finally(() => setLoading(false));
  }, [fetchPage]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, headline, university, country, major, avatar_url")
        .eq("open_to_collaboration", true)
        .not("full_name", "is", null)
        .limit(5);
      setSuggested((data ?? []).filter((p) => p.id !== user?.id) as PostAuthor[]);
    })();
  }, [user]);

  const trending = useMemo(() => {
    const counts = new Map<string, number>();
    posts.forEach((p) => p.tags.forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1)));
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [posts]);

  const createPost = async () => {
    if (!user || !body.trim()) return;
    setPosting(true);
    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: user.id,
        type,
        title: title.trim() || null,
        body: body.trim(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      })
      .select()
      .single();
    setPosting(false);
    if (error) return toast.error(error.message);
    setPosts((prev) => [data as FeedPostRow, ...prev]);
    hydrateAuthors([user.id]);
    setTitle("");
    setBody("");
    setTags("");
    toast.success("Published to the community");
  };

  const toggleReaction = async (postId: string, kind: string) => {
    if (!user) return;
    const has = (mine[postId] ?? []).includes(kind);
    setMine((prev) => ({
      ...prev,
      [postId]: has ? (prev[postId] ?? []).filter((k) => k !== kind) : [...(prev[postId] ?? []), kind],
    }));
    setReactions((prev) => ({
      ...prev,
      [postId]: { ...(prev[postId] ?? {}), [kind]: Math.max(0, ((prev[postId] ?? {})[kind] ?? 0) + (has ? -1 : 1)) },
    }));
    if (has) {
      await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", user.id).eq("kind", kind);
    } else {
      await supabase.from("post_reactions").insert({ post_id: postId, user_id: user.id, kind });
    }
  };

  const loadComments = async (postId: string) => {
    const { data } = await supabase
      .from("post_comments")
      .select("id, user_id, body, created_at")
      .eq("post_id", postId)
      .order("created_at");
    setComments((prev) => ({ ...prev, [postId]: data ?? [] }));
    hydrateAuthors((data ?? []).map((c) => c.user_id));
  };

  const addComment = async (postId: string, text: string) => {
    if (!user) return;
    const { data, error } = await supabase
      .from("post_comments")
      .insert({ post_id: postId, user_id: user.id, body: text })
      .select("id, user_id, body, created_at")
      .single();
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), data] }));
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comment_count: p.comment_count + 1 } : p)));
  };

  const deletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) return toast.error(error.message);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    toast.success("Post deleted");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <div className="min-w-0">
          {user ? (
            <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
              <div className="flex gap-3">
                <Avatar initials={initialsOf(me?.full_name ?? authors[user.id]?.full_name ?? user.email)} src={me?.avatar_url ?? authors[user.id]?.avatar_url} size="sm" />
                <div className="min-w-0 flex-1 space-y-2">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Title (optional)"
                    className="h-9 rounded-lg text-sm"
                  />
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Share a finding, ask a research question, or look for a collaborator..."
                    className="min-h-[80px] resize-none rounded-lg text-sm"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="h-8 w-[160px] rounded-lg text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {postTypes.map((t) => (
                          <SelectItem key={t} value={t} className="text-xs capitalize">
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="Tags, comma separated"
                      className="h-8 flex-1 min-w-[160px] rounded-lg text-xs"
                    />
                    <Button
                      size="sm"
                      className="ml-auto h-8 rounded-lg px-4 text-xs"
                      disabled={!body.trim() || posting}
                      onClick={createPost}
                    >
                      {posting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Publish"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
              <p className="text-sm text-muted-foreground">Sign in to publish research and join the discussion.</p>
              <Link to="/auth">
                <Button size="sm" className="rounded-lg">Sign in</Button>
              </Link>
            </div>
          )}

          <div className="-mx-1 mt-6 flex gap-1.5 overflow-x-auto px-1 pb-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={cn(
                  "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
                  active === f
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:text-primary",
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState
                icon={FileSearch}
                title="No research published yet"
                description="Be the first researcher to share a finding, a question or a collaboration call with the Academix network."
                steps={[
                  "Post a finding, question or call for co-authors.",
                  "Add publications to your profile so people can cite them.",
                  "Follow researchers to shape your feed.",
                ]}
              />
            ) : (
              <>
                {posts.map((p) => (
                  <PostCard
                    key={p.id}
                    post={p}
                    author={authors[p.author_id]}
                    counts={reactions[p.id] ?? {}}
                    mine={mine[p.id] ?? []}
                    comments={comments[p.id] ?? []}
                    authorsById={authors}
                    canDelete={user?.id === p.author_id}
                    signedIn={!!user}
                    onToggleReaction={toggleReaction}
                    onLoadComments={loadComments}
                    onComment={addComment}
                    onDelete={deletePost}
                  />
                ))}
                {!done && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      disabled={loadingMore}
                      onClick={async () => {
                        setLoadingMore(true);
                        await fetchPage(posts.length, false);
                        setLoadingMore(false);
                      }}
                    >
                      {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load more"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" /> Trending topics
            </h2>
            {trending.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">No topics yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {trending.map(([tag, count]) => (
                  <li key={tag} className="flex items-center justify-between text-sm">
                    <span className="truncate text-primary">{tag}</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> Open to collaboration
            </h2>
            {suggested.length === 0 ? (
              <p className="mt-3 text-xs text-muted-foreground">No collaborators found yet.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {suggested.map((p) => (
                  <li key={p.id}>
                    <Link to={`/researcher/${p.id}`} className="flex items-center gap-2.5 group">
                      <Avatar initials={initialsOf(p.full_name)} src={p.avatar_url} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-primary group-hover:underline">{p.full_name}</p>
                        <p className="truncate text-xs text-muted-foreground">{p.headline || p.university || "Researcher"}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Community;
