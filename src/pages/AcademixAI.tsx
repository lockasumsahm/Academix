import { useEffect, useRef, useState } from "react";
import { ArrowUp, Loader2, Sparkles, RotateCcw, Copy, Check, Square } from "lucide-react";
import { PageHeader } from "@/components/network/PageHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Markdown } from "@/components/ai/Markdown";
import { useSeo } from "@/hooks/useSeo";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const aiModes = [
  {
    name: "Research Mentor",
    desc: "Develop ideas, surface gaps, pressure-test your framing.",
    suggestions: [
      "Turn my rough interest in low-resource NLP into three testable research questions",
      "What is the biggest weakness in this framing? [paste your idea]",
      "Suggest a feasible undergraduate-scale study for my topic",
    ],
  },
  {
    name: "Literature Review",
    desc: "Summarise, compare and map the papers that matter.",
    suggestions: [
      "Map the main research directions in speech recognition for dialects",
      "Compare these two approaches and tell me where they disagree",
      "What should I read first to enter this field?",
    ],
  },
  {
    name: "Writing Coach",
    desc: "Clarity, academic tone, abstracts and conclusions.",
    suggestions: [
      "Rewrite my abstract for clarity: [paste abstract]",
      "Make this paragraph sound academic without inflating it",
      "Draft a conclusion from these findings: [paste]",
    ],
  },
  {
    name: "Research Planner",
    desc: "Milestones, reading schedule, submission timeline.",
    suggestions: [
      "Build a 12-week research roadmap with weekly milestones",
      "Plan a realistic reading schedule for 30 papers in 6 weeks",
      "Work backwards from a submission deadline in November",
    ],
  },
  {
    name: "Professor Finder",
    desc: "Match your work to supervisors and explain why.",
    suggestions: [
      "What kind of supervisor fits a project on multilingual speech models?",
      "What should I check about a professor before emailing them?",
      "Draft the questions I should ask a potential supervisor",
    ],
  },
  {
    name: "Scholarship Advisor",
    desc: "Eligibility, preparation roadmap, deadlines.",
    suggestions: [
      "What does a strong fully-funded masters application need?",
      "Build a preparation roadmap for applying next cycle",
      "How do I explain a gap year in a motivation letter?",
    ],
  },
];

type ChatMessage = { role: "user" | "assistant"; content: string };

const FUNCTIONS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/academix-ai`;
const STORAGE_KEY = "academix:ai:thread";

const AcademixAI = () => {
  const [mode, setMode] = useState(aiModes[0].name);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      return Array.isArray(parsed) ? (parsed as ChatMessage[]) : [];
    } catch {
      return [];
    }
  });
  const [streaming, setStreaming] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useSeo(
    "Academix AI | Research Assistant for Students",
    "Your AI research partner: develop ideas, review papers, build literature maps, plan milestones, find professors and prepare applications.",
    { noindex: true },
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streaming]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30)));
    } catch {
      /* storage full or unavailable */
    }
  }, [messages]);

  const activeMode = aiModes.find((m) => m.name === mode) ?? aiModes[0];

  const copy = async (text: string, i: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(i);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  const stop = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
  };

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || streaming) return;

    const history: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(history);
    setInput("");
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        toast.error("Please sign in again to use Academix AI.");
        setStreaming(false);
        return;
      }

      const res = await fetch(FUNCTIONS_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: history.slice(-20) }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const info = await res.json().catch(() => ({ error: "Something went wrong." }));
        toast.error(info.error ?? "Academix AI could not answer right now.");
        setStreaming(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;
          try {
            const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) {
              answer += delta;
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { role: "assistant", content: answer };
                return next;
              });
            }
          } catch {
            /* partial chunk, wait for more */
          }
        }
      }

      if (!answer) {
        setMessages((prev) => prev.slice(0, -1));
        toast.error("Academix AI returned an empty answer. Try rephrasing.");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        toast.error("Network problem — could not reach Academix AI.");
      }
    } finally {
      abortRef.current = null;
      setStreaming(false);
    }
  };

  const hasChat = messages.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
      <PageHeader
        eyebrow="Academix AI"
        title="Your research partner, from idea to publication"
        subtitle="Discover ideas, strengthen your writing, map the literature, find collaborators and prepare applications — with a confidence level on every answer."
      />

      {/* Mode switcher */}
      <div className="mb-5 flex flex-wrap gap-1.5">
        {aiModes.map((m) => (
          <button
            key={m.name}
            onClick={() => setMode(m.name)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
              mode === m.name
                ? "border-accent bg-accent/10 text-primary"
                : "border-border text-muted-foreground hover:border-accent/30 hover:text-primary",
            )}
          >
            {m.name}
          </button>
        ))}
      </div>

      {hasChat && (
        <div className="mb-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "rounded-2xl border p-4",
                m.role === "user"
                  ? "border-border bg-secondary/50"
                  : "border-border bg-card shadow-soft",
              )}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                  {m.role === "user" ? "You" : "Academix AI"}
                </p>
                {m.role === "assistant" && m.content && (
                  <button
                    onClick={() => void copy(m.content, i)}
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Copy answer"
                  >
                    {copied === i ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
              {m.role === "user" ? (
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-primary">{m.content}</p>
              ) : m.content ? (
                <Markdown>{m.content}</Markdown>
              ) : (
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                </span>
              )}
            </div>
          ))}
          <div ref={endRef} />
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-xs text-muted-foreground"
            onClick={() => setMessages([])}
            disabled={streaming}
          >
            <RotateCcw className="h-3.5 w-3.5" /> New conversation
          </Button>
        </div>
      )}

      {/* Composer */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-elevated">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder={`Ask ${activeMode.name} anything…`}
          className="min-h-[96px] resize-none border-0 bg-transparent px-1 text-base shadow-none focus-visible:ring-0"
        />
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <p className="truncate text-xs text-muted-foreground">
            Mode: <span className="font-medium text-primary">{mode}</span>
          </p>
          {streaming ? (
            <Button size="sm" variant="outline" className="gap-1.5 rounded-lg" onClick={stop}>
              <Square className="h-3 w-3" /> Stop
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-9 w-9 rounded-lg"
              disabled={!input.trim()}
              aria-label="Send to Academix AI"
              onClick={() => void send()}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {!hasChat && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {activeMode.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setInput(s)}
              className="rounded-full border border-border px-3.5 py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:border-accent/30 hover:text-primary"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <section className="mt-14">
        <h2 className="mb-4 text-sm font-semibold text-primary">Specialised agents</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {aiModes.map((m) => (
            <button
              key={m.name}
              onClick={() => setMode(m.name)}
              className={cn(
                "rounded-2xl border p-5 text-left transition-all duration-300",
                mode === m.name
                  ? "border-accent bg-accent/[0.04] shadow-elevated"
                  : "border-border bg-card shadow-soft hover:shadow-elevated",
              )}
            >
              <div className="flex items-center gap-2">
                <Sparkles className={cn("h-4 w-4", mode === m.name ? "text-accent" : "text-muted-foreground")} />
                <h3 className="text-sm font-semibold text-primary">{m.name}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-secondary/40 p-6">
        <h2 className="text-sm font-semibold text-primary">Confidence indicators</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Every response is labelled so you always know what it is based on.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "High confidence", desc: "Supported by the uploaded document or well-established literature." },
            { label: "Medium confidence", desc: "A reasonable inference that should be verified." },
            { label: "Low confidence", desc: "Brainstorming or speculative direction." },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-semibold text-primary">{c.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AcademixAI;
