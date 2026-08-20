/**
 * Static security gate. Runs on every build (prebuild) and in CI.
 * Fails the build when a high-signal insecure pattern is found in client code.
 *
 * Usage: bunx tsx scripts/security-check.ts
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const SCAN_DIRS = ["src", "supabase/functions", "scripts"];
const SCAN_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".html"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".git", ".vite"]);

type Severity = "error" | "warning";
interface Rule {
  id: string;
  severity: Severity;
  message: string;
  test: RegExp;
  /** Files (relative paths) that are legitimately allowed to match. */
  allow?: RegExp;
  /** Only apply the rule to files matching this pattern. */
  only?: RegExp;
  /** Check a few surrounding lines for `rel=` before reporting. */
  windowed?: boolean;
}

const RULES: Rule[] = [
  {
    id: "service-role-key-in-client",
    severity: "error",
    message:
      "Service role key referenced in client code. It must only ever be read inside an edge function via Deno.env.",
    test: /SUPABASE_SERVICE_ROLE_KEY|service_role/i,
    only: /^src\//,
  },
  {
    id: "hardcoded-jwt-secret",
    severity: "error",
    message:
      "Hardcoded JWT-looking credential. Use environment variables / the secrets manager instead.",
    test: /['"`]eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}['"`]/,
    allow: /^src\/integrations\/supabase\/client\.ts$/,
  },
  {
    id: "private-key-literal",
    severity: "error",
    message: "Private key material committed in source.",
    test: /-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    id: "dangerous-html",
    severity: "error",
    message:
      "dangerouslySetInnerHTML can introduce XSS. Render text through React or sanitize the HTML first.",
    test: /dangerouslySetInnerHTML/,
    allow: /^src\/components\/ui\/chart\.tsx$/,
  },
  {
    id: "eval-usage",
    severity: "error",
    message: "eval()/new Function() on client input enables code injection.",
    test: /(^|[^.\w])eval\s*\(|new\s+Function\s*\(/,
  },
  {
    id: "cors-wildcard-with-auth",
    severity: "warning",
    message:
      "Edge function allows any origin. Confirm the function requires a verified JWT before trusting the caller.",
    test: /Access-Control-Allow-Origin["']?\s*:\s*["']\*/,
    only: /^supabase\/functions\//,
  },
  {
    id: "target-blank-without-noopener",
    severity: "warning",
    message:
      'target="_blank" without rel="noopener noreferrer" exposes window.opener to the destination page.',
    test: /target=\{?["']_blank["']\}?/,
    // `rel` is often on a neighbouring line in formatted JSX, so we widen the
    // match window below before reporting.
    windowed: true,
  },
  {
    id: "insecure-http-url",
    severity: "warning",
    message: "Plain http:// URL. Use https:// so requests are not sent in clear text.",
    test: /["'`]http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0|\[::|www\.w3\.org|www\.sitemaps\.org|schemas\.|ns\.adobe)/,
  },
];

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SCAN_EXT.has(extname(full))) out.push(full);
  }
  return out;
}

interface Finding {
  rule: Rule;
  file: string;
  line: number;
  snippet: string;
}

const findings: Finding[] = [];
const files = [
  ...SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))),
  ...(existsSync(join(ROOT, "index.html")) ? [join(ROOT, "index.html")] : []),
];

const SELF = "scripts/security-check.ts";

for (const file of files) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel === SELF) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  for (const rule of RULES) {
    if (rule.only && !rule.only.test(rel)) continue;
    if (rule.allow && rule.allow.test(rel)) continue;
    lines.forEach((text, i) => {
      if (text.includes("security-check-ignore")) return;
      if (!rule.test.test(text)) return;
      if (rule.windowed) {
        const context = lines.slice(Math.max(0, i - 4), i + 5).join("\n");
        if (/rel=\{?["'][^"']*no(opener|referrer)/.test(context)) return;
      }
      {
        findings.push({ rule, file: rel, line: i + 1, snippet: text.trim().slice(0, 140) });
      }
    });
  }
}

const errors = findings.filter((f) => f.rule.severity === "error");
const warnings = findings.filter((f) => f.rule.severity === "warning");

const print = (list: Finding[], label: string) => {
  if (!list.length) return;
  console.log(`\n${label} (${list.length}):`);
  for (const f of list) {
    console.log(`  [${f.rule.id}] ${f.file}:${f.line}`);
    console.log(`      ${f.rule.message}`);
    console.log(`      > ${f.snippet}`);
  }
};

console.log(`Security check: scanned ${files.length} files with ${RULES.length} rules.`);
print(errors, "ERRORS");
print(warnings, "WARNINGS");

if (errors.length) {
  console.error(`\nSecurity check failed: ${errors.length} blocking issue(s).`);
  process.exit(1);
}
console.log(`\nSecurity check passed (${warnings.length} warning(s)).`);
