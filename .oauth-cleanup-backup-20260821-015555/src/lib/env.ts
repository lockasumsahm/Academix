/**
 * Public runtime configuration.
 *
 * Only PUBLIC values live here. Everything in `import.meta.env.VITE_*` is
 * inlined into the browser bundle at build time, so secrets (service-role
 * keys, API keys, tokens) must never be read through this module — they belong
 * in edge-function secrets on the server side.
 *
 * Missing configuration is detected up-front so the app can render a clear
 * configuration screen instead of dying with a cryptic white page.
 */

export interface PublicEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
  /** Canonical public site URL; falls back to the current origin at runtime. */
  siteUrl: string;
}

const REQUIRED_VARS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"] as const;

function readEnv(name: string): string {
  const value = (import.meta.env as Record<string, string | undefined>)[name];
  return typeof value === "string" ? value.trim() : "";
}

/** Names of required env vars that are missing or empty. */
export function missingEnvVars(): string[] {
  return REQUIRED_VARS.filter((name) => !readEnv(name));
}

/** Best-effort site origin — never hard-coded to a host or localhost. */
export function siteOrigin(): string {
  const configured = readEnv("VITE_SITE_URL");
  if (configured) return configured.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
}

export function getPublicEnv(): PublicEnv {
  return {
    supabaseUrl: readEnv("VITE_SUPABASE_URL"),
    supabaseAnonKey: readEnv("VITE_SUPABASE_PUBLISHABLE_KEY"),
    siteUrl: siteOrigin(),
  };
}

/** Absolute URL for auth redirects — works on any host, no localhost assumptions. */
export function authRedirectUrl(path = "/"): string {
  const base = siteOrigin();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${suffix}` : suffix;
}

export const isDev = import.meta.env.DEV;
