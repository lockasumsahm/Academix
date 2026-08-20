import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const authHeader = req.headers.get("Authorization") ?? "";

  // Validate the caller's JWT.
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  let payload: { action?: string; entry_id?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const action = payload.action;
  if (action !== "view" && action !== "download" && action !== "mine") {
    return json({ error: "Invalid action" }, 400);
  }

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  if (action === "mine") {
    const { data, error } = await admin
      .from("profile_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    if (error) return json({ error: "Could not load entries" }, 500);
    return json({ entries: data ?? [] });
  }

  const entryId = payload.entry_id;
  if (!entryId || !UUID.test(entryId)) return json({ error: "Invalid entry_id" }, 400);

  const column = action === "view" ? "view_count" : "download_count";
  const { data: row, error: readError } = await admin
    .from("profile_entries")
    .select(`id, ${column}`)
    .eq("id", entryId)
    .maybeSingle();
  if (readError || !row) return json({ error: "Entry not found" }, 404);

  const current = Number((row as Record<string, unknown>)[column] ?? 0);
  const { error } = await admin
    .from("profile_entries")
    .update({ [column]: current + 1 })
    .eq("id", entryId);
  if (error) return json({ error: "Could not record activity" }, 500);
  return json({ ok: true });
});
