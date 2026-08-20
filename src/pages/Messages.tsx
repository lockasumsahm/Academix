import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCheck, FileText, Inbox, Loader2, Paperclip, PenSquare, Search, Send, X } from "lucide-react";
import { Avatar } from "@/components/network/Avatar";
import { EmptyState } from "@/components/network/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSeo } from "@/hooks/useSeo";
import { clockTime, initialsOf, timeAgo } from "@/lib/format";
import { getSignedUrl } from "@/lib/storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Peer {
  id: string;
  full_name: string | null;
  headline: string | null;
  university: string | null;
  avatar_url: string | null;
}
interface Thread {
  id: string;
  topic: string | null;
  last_message_at: string;
  peer?: Peer;
  preview?: string;
  unread: number;
}
interface Msg {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  attachment_name: string | null;
  created_at: string;
}

const MSG_COLUMNS = "id, conversation_id, sender_id, body, attachment_url, attachment_name, created_at";
const PEER_COLUMNS = "id, full_name, headline, university, avatar_url";
const MAX_FILE_MB = 20;

const Attachment = ({ reference, name, mine }: { reference: string; name: string | null; mine: boolean }) => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    getSignedUrl(reference).then((u) => active && setUrl(u));
    return () => {
      active = false;
    };
  }, [reference]);

  const isImage = /\.(png|jpe?g|gif|webp|avif)$/i.test(reference);
  if (isImage && url) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="mt-1 block overflow-hidden rounded-xl">
        <img src={url} alt={name ?? "Shared image"} className="max-h-64 w-full object-cover" loading="lazy" />
      </a>
    );
  }
  return (
    <a
      href={url ?? undefined}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "mt-1 flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs",
        mine ? "border-primary-foreground/25 text-primary-foreground" : "border-border text-foreground",
      )}
    >
      <FileText className="h-4 w-4 shrink-0" />
      <span className="truncate">{name ?? "Attachment"}</span>
    </a>
  );
};

const Messages = () => {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [peerLastRead, setPeerLastRead] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [people, setPeople] = useState<Peer[]>([]);
  const [peopleQuery, setPeopleQuery] = useState("");
  const [starting, setStarting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useSeo(
    "Messages | Academix Research Network",
    "Real-time research messaging: collaboration threads, lab invitations, mentorship and paper discussions in one focused inbox.",
    { noindex: true },
  );

  const loadThreads = useCallback(async () => {
    if (!user) return;
    const { data: mine } = await supabase
      .from("conversation_participants")
      .select("conversation_id, last_read_at")
      .eq("user_id", user.id);
    const ids = (mine ?? []).map((p) => p.conversation_id);
    if (ids.length === 0) {
      setThreads([]);
      setLoading(false);
      return;
    }
    const readAt = new Map((mine ?? []).map((p) => [p.conversation_id, p.last_read_at]));
    const [{ data: convs }, { data: others }, { data: recent }] = await Promise.all([
      supabase.from("conversations").select("id, topic, last_message_at").in("id", ids).order("last_message_at", { ascending: false }),
      supabase.from("conversation_participants").select("conversation_id, user_id").in("conversation_id", ids).neq("user_id", user.id),
      supabase.from("messages").select("conversation_id, sender_id, body, attachment_name, created_at").in("conversation_id", ids).order("created_at", { ascending: false }).limit(400),
    ]);
    const peerIds = Array.from(new Set((others ?? []).map((o) => o.user_id)));
    const { data: profs } = peerIds.length
      ? await supabase.from("profiles").select(PEER_COLUMNS).in("id", peerIds)
      : { data: [] as Peer[] };
    const byConv = new Map((others ?? []).map((o) => [o.conversation_id, o.user_id]));
    const profById = new Map((profs ?? []).map((p) => [p.id, p as Peer]));

    const preview = new Map<string, string>();
    const unread = new Map<string, number>();
    for (const m of recent ?? []) {
      if (!preview.has(m.conversation_id)) {
        preview.set(m.conversation_id, m.body?.trim() || m.attachment_name || "Attachment");
      }
      const seen = readAt.get(m.conversation_id);
      if (m.sender_id !== user.id && (!seen || new Date(m.created_at) > new Date(seen))) {
        unread.set(m.conversation_id, (unread.get(m.conversation_id) ?? 0) + 1);
      }
    }

    setThreads(
      (convs ?? []).map((c) => ({
        ...c,
        peer: profById.get(byConv.get(c.id) ?? ""),
        preview: preview.get(c.id),
        unread: unread.get(c.id) ?? 0,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const openWith = useCallback(
    async (peerId: string) => {
      if (!user || peerId === user.id) return null;
      const { data, error } = await supabase.functions.invoke("start-conversation", {
        body: { peer_id: peerId },
      });
      const convId = (data as { conversation_id?: string } | null)?.conversation_id ?? null;
      if (error || !convId) {
        const message = (data as { error?: string } | null)?.error;
        toast.error(message ?? error?.message ?? "Could not start the conversation");
        return null;
      }
      await loadThreads();
      setActiveId(convId);
      setMobileThread(true);
      return convId;
    },
    [user, loadThreads],
  );

  // Start a conversation from ?to=<userId>
  useEffect(() => {
    const to = params.get("to");
    if (!user || !to) return;
    params.delete("to");
    setParams(params, { replace: true });
    openWith(to);
  }, [params, setParams, user, openWith]);

  // Load + subscribe to the active thread
  useEffect(() => {
    if (!activeId || !user) return;
    let active = true;
    setLoadingMsgs(true);
    (async () => {
      const { data } = await supabase.from("messages").select(MSG_COLUMNS).eq("conversation_id", activeId).order("created_at");
      if (!active) return;
      setMessages((data as Msg[]) ?? []);
      setLoadingMsgs(false);
    })();

    const markRead = async () => {
      await supabase
        .from("conversation_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", activeId)
        .eq("user_id", user.id);
      setThreads((prev) => prev.map((t) => (t.id === activeId ? { ...t, unread: 0 } : t)));
    };
    markRead();

    const loadPeerRead = async () => {
      const { data } = await supabase
        .from("conversation_participants")
        .select("user_id, last_read_at")
        .eq("conversation_id", activeId)
        .neq("user_id", user.id);
      if (active) setPeerLastRead(data?.[0]?.last_read_at ?? null);
    };
    loadPeerRead();

    const channel = supabase
      .channel(`conversation:${activeId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${activeId}` },
        (payload) => {
          const msg = payload.new as Msg;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (msg.sender_id !== user.id) markRead();
          loadThreads();
        },
      )
      .subscribe();

    const poll = window.setInterval(loadPeerRead, 15000);
    return () => {
      active = false;
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // People search for the compose dialog
  useEffect(() => {
    if (!composeOpen || !user) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      let q = supabase.from("profiles").select(PEER_COLUMNS).neq("id", user.id).limit(12);
      if (peopleQuery.trim()) q = q.ilike("full_name", `%${peopleQuery.trim()}%`);
      const { data } = await q;
      if (active) setPeople((data as Peer[]) ?? []);
    }, 200);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [composeOpen, peopleQuery, user]);

  const active = threads.find((t) => t.id === activeId);
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter(
      (t) =>
        (t.peer?.full_name ?? "Researcher").toLowerCase().includes(q) ||
        (t.preview ?? "").toLowerCase().includes(q) ||
        (t.peer?.university ?? "").toLowerCase().includes(q),
    );
  }, [threads, query]);

  const pickFile = (file: File | null) => {
    if (!file) return;
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      toast.error(`Files must be under ${MAX_FILE_MB}MB`);
      return;
    }
    setPending(file);
  };

  const send = async () => {
    if (!user || !activeId || sending) return;
    const text = draft.trim();
    if (!text && !pending) return;
    setSending(true);
    try {
      let attachmentUrl: string | null = null;
      let attachmentName: string | null = null;
      if (pending) {
        const ext = pending.name.split(".").pop()?.toLowerCase() ?? "bin";
        const path = `${activeId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("message-attachments").upload(path, pending, { cacheControl: "3600" });
        if (upErr) throw upErr;
        attachmentUrl = `message-attachments/${path}`;
        attachmentName = pending.name;
      }
      const { data, error } = await supabase
        .from("messages")
        .insert({ conversation_id: activeId, sender_id: user.id, body: text, attachment_url: attachmentUrl, attachment_name: attachmentName })
        .select(MSG_COLUMNS)
        .single();
      if (error) throw error;
      setDraft("");
      setPending(null);
      if (fileRef.current) fileRef.current.value = "";
      setMessages((prev) => (prev.some((m) => m.id === data.id) ? prev : [...prev, data as Msg]));
      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", activeId);
      loadThreads();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Message could not be sent");
    } finally {
      setSending(false);
    }
  };

  const lastMine = [...messages].reverse().find((m) => m.sender_id === user?.id);
  const peerHasRead = !!(lastMine && peerLastRead && new Date(peerLastRead) >= new Date(lastMine.created_at));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="grid h-[calc(100vh-13rem)] min-h-[520px] grid-cols-1 md:grid-cols-[320px_1fr]">
          <div className={cn("flex flex-col border-r border-border", mobileThread && "hidden md:flex")}>
            <div className="space-y-2 border-b border-border p-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search conversations"
                    className="h-9 rounded-lg pl-9 text-sm"
                  />
                </div>
                <Button size="icon" className="h-9 w-9 shrink-0 rounded-lg" onClick={() => setComposeOpen(true)} aria-label="New message">
                  <PenSquare className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-3 p-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-9 w-9 animate-pulse rounded-full bg-secondary" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-3 w-2/3 animate-pulse rounded bg-secondary" />
                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-secondary" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : list.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <p className="text-xs text-muted-foreground">
                    {threads.length === 0 ? "No conversations yet." : "No conversations match that search."}
                  </p>
                  {threads.length === 0 && (
                    <Button size="sm" variant="outline" className="mt-4 rounded-lg" onClick={() => setComposeOpen(true)}>
                      <PenSquare className="mr-2 h-3.5 w-3.5" /> New message
                    </Button>
                  )}
                </div>
              ) : (
                list.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveId(t.id);
                      setMobileThread(true);
                    }}
                    className={cn(
                      "flex w-full gap-3 border-b border-border/60 px-3 py-3 text-left transition-colors",
                      t.id === activeId ? "bg-secondary" : "hover:bg-secondary/50",
                    )}
                  >
                    <Avatar initials={initialsOf(t.peer?.full_name)} src={t.peer?.avatar_url} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate text-sm text-primary", t.unread ? "font-semibold" : "font-medium")}>
                        {t.peer?.full_name || "Researcher"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.preview || t.peer?.headline || t.peer?.university || "Start the conversation"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-[11px] text-muted-foreground">{timeAgo(t.last_message_at)}</span>
                      {t.unread > 0 && (
                        <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                          {t.unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={cn("flex flex-col", !mobileThread && "hidden md:flex")}>
            {!active ? (
              <div className="flex flex-1 items-center justify-center p-6">
                <EmptyState
                  icon={Inbox}
                  title="No conversation selected"
                  description="Choose a thread, or start a new one with a researcher."
                  action={
                    <Button size="sm" className="rounded-lg" onClick={() => setComposeOpen(true)}>
                      <PenSquare className="mr-2 h-3.5 w-3.5" /> New message
                    </Button>
                  }
                />
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => setMobileThread(false)} aria-label="Back to inbox">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar initials={initialsOf(active.peer?.full_name)} src={active.peer?.avatar_url} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-primary">{active.peer?.full_name || "Researcher"}</p>
                    <p className="truncate text-xs text-muted-foreground">{active.peer?.headline || active.peer?.university || ""}</p>
                  </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {loadingMsgs ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : messages.length === 0 ? (
                    <p className="py-10 text-center text-xs text-muted-foreground">No messages yet. Say hello.</p>
                  ) : (
                    messages.map((m) => {
                      const mine = m.sender_id === user?.id;
                      return (
                        <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl px-3.5 py-2 text-sm",
                              mine ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground",
                            )}
                          >
                            {m.body && <p className="whitespace-pre-wrap break-words">{m.body}</p>}
                            {m.attachment_url && <Attachment reference={m.attachment_url} name={m.attachment_name} mine={mine} />}
                            <p className={cn("mt-1 flex items-center gap-1 text-[10px]", mine ? "text-primary-foreground/70" : "text-muted-foreground")}>
                              {clockTime(m.created_at)}
                              {mine && m.id === lastMine?.id && (peerHasRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                <div className="border-t border-border p-3">
                  {pending && (
                    <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-2.5 py-1.5 text-xs">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{pending.name}</span>
                      <button
                        onClick={() => {
                          setPending(null);
                          if (fileRef.current) fileRef.current.value = "";
                        }}
                        aria-label="Remove attachment"
                        className="ml-auto text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <input
                      ref={fileRef}
                      type="file"
                      className="hidden"
                      accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.csv,.txt"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl"
                      onClick={() => fileRef.current?.click()}
                      aria-label="Attach a file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          send();
                        }
                      }}
                      placeholder="Write a message"
                      className="h-10 rounded-xl text-sm"
                    />
                    <Button
                      size="icon"
                      className="h-10 w-10 shrink-0 rounded-xl"
                      disabled={sending || (!draft.trim() && !pending)}
                      onClick={send}
                      aria-label="Send message"
                    >
                      {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New message</DialogTitle>
            <DialogDescription>Search the Academix network and start a conversation.</DialogDescription>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={peopleQuery}
              onChange={(e) => setPeopleQuery(e.target.value)}
              placeholder="Search researchers by name"
              className="h-10 rounded-lg pl-9 text-sm"
            />
          </div>
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {people.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">No researchers found.</p>
            ) : (
              people.map((p) => (
                <button
                  key={p.id}
                  disabled={starting}
                  onClick={async () => {
                    setStarting(true);
                    const id = await openWith(p.id);
                    setStarting(false);
                    if (id) {
                      setComposeOpen(false);
                      setPeopleQuery("");
                    }
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-secondary disabled:opacity-60"
                >
                  <Avatar initials={initialsOf(p.full_name)} src={p.avatar_url} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-primary">{p.full_name || "Researcher"}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.headline || p.university || "Academix member"}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;
