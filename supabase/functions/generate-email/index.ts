import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsFor } from "../_shared/cors.ts";


serve(async (req) => {
  const corsHeaders = corsFor(req);
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth check — prevent unauthenticated abuse of paid AI service
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      professorName, professorDepartment, professorUniversity,
      professorResearchAreas, professorLabName,
      studentName, studentEmail, university, major,
      researchTopic, researchAbstract, whyThisProfessor,
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("AI service not configured");

    const systemPrompt = `You are an expert academic email writer. Generate a professional, personalized research inquiry email from a student to a professor. The email should be formal but warm, concise, and demonstrate genuine interest in the professor's work. Include:
1. A compelling subject line
2. Professional greeting
3. Brief student introduction
4. Clear statement of research interest
5. Specific reference to the professor's work/lab
6. A polite request for guidance or mentorship
7. Professional closing

Format the output as:
Subject: [subject line]

[email body]

Keep the email concise (200-350 words). Make it feel personal, not templated.`;

    const userPrompt = `Generate a research inquiry email with these details:

Professor: ${professorName}
Department: ${professorDepartment}
University: ${professorUniversity}
Research Areas: ${(professorResearchAreas || []).join(", ")}
Lab: ${professorLabName || "Not specified"}

Student: ${studentName}
Student University: ${university || "Not specified"}
Student Major: ${major || "Not specified"}
Research Topic: ${researchTopic}
Research Abstract: ${researchAbstract || "Not provided"}
Why this professor: ${whyThisProfessor || "Not specified"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const email = data.choices?.[0]?.message?.content || "Failed to generate email.";

    return new Response(JSON.stringify({ email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-email error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
