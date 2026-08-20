import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { corsFor } from "../_shared/cors.ts";


Deno.serve(async (req) => {
  const corsHeaders = corsFor(req, "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const count = async (
      table: string,
      apply?: (q: any) => any,
    ): Promise<number> => {
      let q = admin.from(table).select("*", { count: "exact", head: true });
      if (apply) q = apply(q);
      const { count: c } = await q;
      return c ?? 0;
    };

    const [
      members,
      publications,
      posts,
      professors,
      accepting_professors,
      universities,
      open_opportunities,
    ] = await Promise.all([
      count("profiles"),
      count("profile_entries"),
      count("posts", (q) => q.eq("visibility", "public")),
      count("professors"),
      count("professors", (q) => q.eq("accepting_students", true)),
      count("universities"),
      count("opportunities", (q) => q.eq("status", "open")),
    ]);

    const [{ data: uniRows }, { data: memberRows }] = await Promise.all([
      admin.from("universities").select("country"),
      admin.from("profiles").select("country"),
    ]);

    const distinct = (rows: { country: string | null }[] | null) =>
      new Set(
        (rows ?? [])
          .map((r) => (r.country ?? "").trim())
          .filter((c) => c.length > 0),
      ).size;

    return new Response(
      JSON.stringify({
        members,
        publications,
        posts,
        professors,
        accepting_professors,
        universities,
        university_countries: distinct(uniRows),
        member_countries: distinct(memberRows),
        open_opportunities,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60",
        },
      },
    );
  } catch (_e) {
    return new Response(JSON.stringify({ error: "Unable to load stats" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
