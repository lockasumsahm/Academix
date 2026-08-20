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

  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;
  if (userError || !user) return json({ error: "Unauthorized" }, 401);

  let payload: { peer_id?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const peerId = payload.peer_id ?? "";
  if (!UUID.test(peerId)) return json({ error: "Invalid recipient" }, 400);
  if (peerId === user.id) return json({ error: "You cannot message yourself" }, 400);

  const admin = createClient(supabaseUrl, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

  // The recipient must exist.
  const { data: peer } = await admin
    .from("profiles")
    .select("id, message_privacy")
    .eq("id", peerId)
    .maybeSingle();
  if (!peer) return json({ error: "That person is not on Academix" }, 404);

  // Respect the recipient's messaging preference.
  if (peer.message_privacy === "following") {
    const { count } = await admin
      .from("follows")
      .select("id", { count: "exact", head: true })
      .eq("follower_id", peerId)
      .eq("following_id", user.id);
    if (!count) {
      return json(
        { error: "This person only accepts messages from people they follow." },
        403,
      );
    }
  }

  // Reuse an existing 1:1 conversation when there is one.
  const { data: mine } = await admin
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", user.id);
  const mineIds = (mine ?? []).map((r) => r.conversation_id);

  if (mineIds.length) {
    const { data: match } = await admin
      .from("conversation_participants")
      .select("conversation_id")
      .eq("user_id", peerId)
      .in("conversation_id", mineIds)
      .limit(1);
    const existing = match?.[0]?.conversation_id;
    if (existing) return json({ conversation_id: existing });
  }

  const { data: conv, error: convError } = await admin
    .from("conversations")
    .insert({ created_by: user.id })
    .select("id")
    .single();
  if (convError || !conv) return json({ error: convError?.message ?? "Could not start the conversation" }, 400);

  const { error: partError } = await admin.from("conversation_participants").insert([
    { conversation_id: conv.id, user_id: user.id },
    { conversation_id: conv.id, user_id: peerId },
  ]);
  if (partError) {
    await admin.from("conversations").delete().eq("id", conv.id);
    return json({ error: partError.message }, 400);
  }

  return json({ conversation_id: conv.id });
});
