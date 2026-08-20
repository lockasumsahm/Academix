import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Database, FileText, Github, MessageSquare, Share2, Sparkles, Trash2 } from "lucide-react";
import { Avatar } from "./Avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { initialsOf, timeAgo } from "@/lib/format";
import { toast } from "sonner";

export interface PostAuthor {
  id: string;
  full_name: string | null;
  headline: string | null;
  university: string | null;
  country: string | null;
  major: string | null;
  avatar_url?: string | null;
}

export interface PostComment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface FeedPostRow {
  id: string;
  author_id: string;
  type: string;
  title: string | null;
  body: string;
  tags: string[];
  visibility: string;
  attachment_kind: string | null;
  attachment_label: string | null;
  attachment_meta: string | null;
  comment_count: number;
  created_at: string;
}

const reactionKinds = [
  { key: "insightful", label: "Insightful" },
  { key: "innovative", label: "Innovative" },
  { key: "helpful", label: "Helpful" },
] as const;

const attachmentIcon: Record<string, typeof FileText> = {
  Paper: FileText,
  Dataset: Database,
  Repository: Github,
};

interface Props {
  post: FeedPostRow;
  author?: PostAuthor;
  counts: Record<string, number>;
  mine: string[];
  comments: PostComment[];
  authorsById: Record<string, PostAuthor>;
  canDelete: boolean;
  signedIn: boolean;
  onToggleReaction: (postId: string, kind: string) => void;
  onLoadComments: (postId: string) => void;
  onComment: (postId: string, body: string) => Promise<void>;
  onDelete: (postId: string) => void;
}

export const PostCard = ({
  post,
  author,
  counts,
  mine,
  comments,
  authorsById,
  canDelete,
  signedIn,
  onToggleReaction,
  onLoadComments,
  onComment,
  onDelete,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const Icon = post.attachment_kind ? attachmentIcon[post.attachment_kind] ?? Sparkles : null;
  const name = author?.full_name || "Academix researcher";

  const toggleComments = () => {
    const next = !open;
    setOpen(next);
    if (next) onLoadComments(post.id);
  };

  const submitComment = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await onComment(post.id, draft.trim());
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card shadow-soft transition-shadow duration-300 hover:shadow-elevated">
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar initials={initialsOf(author?.full_name)} src={author?.avatar_url} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2">
              <Link to={`/researcher/${post.author_id}`} className="text-sm font-semibold text-primary hover:underline">
                {name}
              </Link>
              {author?.major && <span className="text-xs text-muted-foreground">· {author.major}</span>}
            </div>
            {(author?.headline || author?.university) && (
              <p className="truncate text-xs text-muted-foreground">
                {author.headline || [author.university, author.country].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {timeAgo(post.created_at)} · {post.visibility === "public" ? "Public" : "Private"} · {post.type}
            </p>
          </div>
          {canDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(post.id)}
              aria-label="Delete post"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {post.title && (
          <h2 className="mt-4 text-base font-semibold leading-snug tracking-tight text-primary sm:text-lg">
            {post.title}
          </h2>
        )}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">{post.body}</p>

        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <span key={t} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                {t}
              </span>
            ))}
          </div>
        )}

        {post.attachment_label && Icon && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-secondary/50 p-3.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{post.attachment_label}</p>
              {post.attachment_meta && (
                <p className="truncate text-xs text-muted-foreground">{post.attachment_meta}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-1.5">
          {reactionKinds.map((r) => {
            const active = mine.includes(r.key);
            return (
              <button
                key={r.key}
                onClick={() => (signedIn ? onToggleReaction(post.id, r.key) : toast.error("Sign in to react"))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted-foreground hover:border-primary/30 hover:text-primary",
                )}
              >
                {r.label}
                {counts[r.key] ? ` · ${counts[r.key]}` : ""}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1 border-t border-border px-3 py-2">
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={toggleComments}>
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
          {post.comment_count || 0}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 text-xs text-muted-foreground"
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/community#${post.id}`);
            toast.success("Link copied");
          }}
        >
          <Share2 className="mr-1.5 h-3.5 w-3.5" />
          Share
        </Button>
      </div>

      {open && (
        <div className="border-t border-border px-5 py-4">
          {comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet. Start the discussion.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar initials={initialsOf(authorsById[c.user_id]?.full_name)} src={authorsById[c.user_id]?.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1 rounded-xl bg-secondary/60 px-3 py-2">
                    <p className="text-xs font-semibold text-primary">
                      {authorsById[c.user_id]?.full_name || "Researcher"}
                      <span className="ml-2 font-normal text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/80">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {signedIn && (
            <div className="mt-3 flex gap-2">
              <Textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a comment"
                className="min-h-[40px] resize-none rounded-xl text-sm"
              />
              <Button size="sm" className="h-9 self-end rounded-lg" disabled={!draft.trim() || sending} onClick={submitComment}>
                Reply
              </Button>
            </div>
          )}
        </div>
      )}
    </article>
  );
};
