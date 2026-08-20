import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const MODE_PROMPTS: Record<string, string> = {
  "Research Mentor":
    "ROLE: Research mentor for students and early-career researchers. Develop ideas into testable research questions, surface gaps, and pressure-test framing. Always name the weakest assumption in the student's idea and propose a feasible, scoped version they can actually execute.",
  "Literature Review":
    "ROLE: Literature review assistant. Summarise, compare and map research directions. NEVER invent citations, DOIs, author names or paper titles — if you are not certain a specific paper exists, describe the line of work generically and tell the student exactly what to search for instead.",
  "Writing Coach":
    "ROLE: Academic writing coach. Improve clarity, structure and academic tone. Always show the revised text first in a blockquote or code-free block, then a short bulleted list of what changed and why. Never inflate simple ideas with jargon.",
  "Research Planner":
    "ROLE: Research planner. Produce realistic, dated milestones, reading schedules and submission timelines. Use a markdown table with columns Week / Focus / Deliverable. Assume a student with limited hours per week and say how many hours each phase needs.",
  "Professor Finder":
    "ROLE: Supervisor-matching advisor. Describe the profile of supervisor that fits the student's work, why it fits, and what to verify (recent publications, funding, group size, whether they take students). Do not fabricate names of real professors or their availability — point the student to the Academix mentor directory to search.",
  "Scholarship Advisor":
    "ROLE: Scholarships and programmes advisor. Cover eligibility, a preparation roadmap and deadline strategy. Flag clearly that dates and criteria change every cycle and must be verified on the official page.",
};

const FORMAT_RULES = `
OUTPUT FORMAT (follow strictly):
- Answer in clean GitHub-flavoured markdown. Never wrap the whole answer in a code block.
- Open with one or two sentences that directly answer the question. No preamble, no "Great question", no restating the prompt.
- Then structure with short bold-headed sections or bullets. Keep bullets to one or two lines each.
- Use a markdown table when comparing three or more items or when giving a schedule.
- Use numbered lists only for ordered steps.
- Bold the key terms, not whole sentences. No emojis.
- Be specific and concrete: name methods, datasets, metrics, section names, week numbers. Avoid generic advice that would apply to any topic.
- If the student's request is vague, give your best useful answer first, then ask at most one sharp clarifying question at the end.
- Keep short questions short: do not pad a one-paragraph answer into a report.
- End any answer longer than three paragraphs with a final line exactly in the form: **Confidence: high|medium|low** — one short clause on why.
- Never claim to have read a file, browsed the web, or accessed the student's data. Never invent citations, statistics or deadlines.`;


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claims, error: claimsError } = await supabase.auth.getClaims(
    authHeader.replace("Bearer ", ""),
  );
  if (claimsError || !claims?.claims) return json({ error: "Unauthorized" }, 401);

  let payload: { messages?: { role: string; content: string }[]; mode?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const messages = Array.isArray(payload.messages) ? payload.messages : [];
  if (!messages.length || messages.length > 40) return json({ error: "Invalid messages" }, 400);
  for (const m of messages) {
    if (
      !m || (m.role !== "user" && m.role !== "assistant") ||
      typeof m.content !== "string" || !m.content.trim() || m.content.length > 8000
    ) {
      return json({ error: "Invalid message content" }, 400);
    }
  }

  const mode = typeof payload.mode === "string" && MODE_PROMPTS[payload.mode]
    ? payload.mode
    : "Research Mentor";

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) return json({ error: "AI is not configured" }, 500);

  const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            `You are Academix AI, the research assistant inside the Academix research network — a platform where students, researchers and professors publish work, connect and find mentors. ` +
            `Today's date is ${new Date().toISOString().slice(0, 10)}.\n\n` +
            `${MODE_PROMPTS[mode]}\n${FORMAT_RULES}`,
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],

    }),
  });

  if (upstream.status === 429) return json({ error: "Rate limit reached. Try again shortly." }, 429);
  if (upstream.status === 402) return json({ error: "AI credits exhausted. Add credits to continue." }, 402);
  if (!upstream.ok || !upstream.body) {
    return json({ error: "The AI service is unavailable right now." }, 502);
  }

  return new Response(upstream.body, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
});
