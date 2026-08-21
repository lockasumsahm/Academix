import { useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark, Download, Eye, ExternalLink, FileText, Heart, MessageSquare } from "lucide-react";
import { Avatar } from "@/components/network/Avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { initialsOf, normalizeUrl, timeAgo } from "@/lib/format";

export interface PubEntry {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  organization: string | null;
  description: string | null;
  url: string | null;
  start_date: string | null;
  file_url: string | null;
  file_name: string | null;
  view_count: number;
  download_count: number;
  created_at: string;
}

export interface EntryComment {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
}

interface Props {
  entry: PubEntry;
  authorName: string;
  liked: boolean;
  likeCount: number;
  bookmarked: boolean;
  commentCount: number;
  comments: EntryComment[] | undefined;
  authorsById: Record<string, string>;
  onToggleLike: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onLoadComments: (id: string) => void;
  onComment: (id: string, body: string) => Promise<void>;
  onPreview: (entry: PubEntry) => void;
  onDownload: (entry: PubEntry) => void;
}

export const PublicationCard = ({
  entry,
  authorName,
  liked,
  likeCount,
  bookmarked,
  commentCount,
  comments,
  authorsById,
  onToggleLike,
  onToggleBookmark,
  onLoadComments,
  onComment,
  onPreview,
  onDownload,
}: Props) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const toggleComments = () => {
    const next = !open;
    setOpen(next);
    if (next) onLoadComments(entry.id);
  };

  const submit = async () => {
    if (!draft.trim()) return;
    setSending(true);
    try {
      await onComment(entry.id, draft.trim());
      setDraft("");
    } finally {
      setSending(false);
    }
  };

  return (
    <article className="surface card-lift overflow-hidden">
      <div className="p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
              entry.kind === "publication" ? "bg-success/10 text-success" : "bg-accent/10 text-accent",
            )}
          >
            {entry.kind}
          </span>
          {entry.start_date && <span className="mono text-[10px] text-muted-foreground">{entry.start_date}</span>}
          <span className="ml-auto flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" /> {entry.view_count}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" /> {entry.download_count}
            </span>
          </span>
        </div>

        <h2 className="serif text-lg font-semibold leading-snug text-primary">{entry.title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {[authorName, entry.organization].filter(Boolean).join(" • ")}
        </p>
        {entry.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{entry.description}</p>
        )}

        {entry.file_url && (
          <button
            onClick={() => onPreview(entry)}
            className="mt-4 flex w-full items-center gap-3 rounded-xl border border-border bg-secondary/40 p-3 text-left transition-colors hover:border-accent/40"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
              <FileText className="h-4 w-4 text-accent" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-primary">
                {entry.file_name ?? "Attached document"}
              </span>
              <span className="block text-[11px] text-muted-foreground">Click to preview</span>
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1 border-t border-border px-3 py-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 text-xs", liked ? "text-accent" : "text-muted-foreground")}
          onClick={() => onToggleLike(entry.id)}
          aria-pressed={liked}
          aria-label={liked ? "Unlike" : "Like"}
        >
          <Heart className={cn("mr-1.5 h-3.5 w-3.5", liked && "fill-current")} />
          {likeCount}
        </Button>
        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={toggleComments}>
          <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
          {commentCount}
        </Button>
        {entry.file_url && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={() => onDownload(entry)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
          </Button>
        )}
        {normalizeUrl(entry.url) && (
          <a href={normalizeUrl(entry.url)!} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Link
            </Button>
          </a>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn("ml-auto h-8 text-xs", bookmarked ? "text-accent" : "text-muted-foreground")}
          onClick={() => onToggleBookmark(entry.id)}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove bookmark" : "Save"}
        >
          <Bookmark className={cn("mr-1.5 h-3.5 w-3.5", bookmarked && "fill-current")} />
          {bookmarked ? "Saved" : "Save"}
        </Button>
      </div>

      {open && (
        <div className="border-t border-border px-5 py-4">
          {!comments ? (
            <p className="text-xs text-muted-foreground">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No comments yet. Start the discussion.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <Avatar initials={initialsOf(authorsById[c.user_id])} size="sm" />
                  <div className="min-w-0 flex-1 rounded-xl bg-secondary/60 px-3 py-2">
                    <p className="text-xs font-semibold text-primary">
                      <Link to={`/researcher/${c.user_id}`} className="hover:underline">
                        {authorsById[c.user_id] || "Researcher"}
                      </Link>
                      <span className="ml-2 font-normal text-muted-foreground">{timeAgo(c.created_at)}</span>
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/80">{c.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-3 flex gap-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment"
              className="min-h-[40px] resize-none rounded-xl text-sm"
            />
            <Button size="sm" className="h-9 self-end rounded-lg" disabled={!draft.trim() || sending} onClick={submit}>
              Reply
            </Button>
          </div>
        </div>
      )}
    </article>
  );
};
