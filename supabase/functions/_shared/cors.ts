/**
 * Shared CORS policy for Academix edge functions.
 *
 * Browsers only send credentials/Authorization headers cross-origin when the
 * server echoes back a concrete origin, so instead of a blanket `*` we reflect
 * the request origin when it is on the allowlist. This keeps authenticated
 * functions safe from being called by arbitrary third-party sites while still
 * working from every hosting provider we deploy to (Vercel / Netlify /
 * Cloudflare Pages / Lovable / local preview).
 *
 * Extra origins can be added at runtime with the `ALLOWED_ORIGINS` secret
 * (comma-separated), so changing hosting never requires a code change.
 */

const STATIC_ALLOWED = [
  "https://academix.inkspirehq.live",
  "https://www.academix.inkspirehq.live",
  "https://inkspire-blueprint.lovable.app",
];

const ALLOWED_PATTERNS: RegExp[] = [
  /^https:\/\/[a-z0-9-]+\.lovable\.app$/i,
  /^https:\/\/[a-z0-9-]+\.lovable\.dev$/i,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
  /^https:\/\/[a-z0-9-]+\.netlify\.app$/i,
  /^https:\/\/[a-z0-9-]+\.pages\.dev$/i,
  // Local development / local production preview.
  /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i,
];

function envAllowed(): string[] {
  const raw = Deno.env.get("ALLOWED_ORIGINS") ?? "";
  return raw
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  const o = origin.replace(/\/$/, "");
  if (STATIC_ALLOWED.includes(o) || envAllowed().includes(o)) return true;
  return ALLOWED_PATTERNS.some((re) => re.test(o));
}

const ALLOW_HEADERS =
  "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version";

/**
 * Build response CORS headers for a request. Unknown origins get no
 * `Access-Control-Allow-Origin` header at all, so the browser blocks the
 * cross-site read while same-origin/server-to-server calls keep working.
 */
export function corsFor(req: Request, methods = "POST, OPTIONS"): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": ALLOW_HEADERS,
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}
