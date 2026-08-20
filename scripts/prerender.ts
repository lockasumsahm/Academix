/**
 * Post-build step: renders the public marketing routes to static HTML so
 * crawlers (and slow devices) get fully-formed content on first byte.
 *
 * It is intentionally fault-tolerant: if any route fails to render, the
 * regular SPA shell is left in place for that route and the build still
 * succeeds.
 */
import { build } from "vite";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const distDir = resolve(root, "dist");
const ssrDir = resolve(root, "node_modules/.prerender");

/** Minimal storage shims: the auth client touches localStorage on import. */
function installStorageShims() {
  const store = new Map<string, string>();
  const shim = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => void store.set(k, String(v)),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  const g = globalThis as Record<string, unknown>;
  if (!g.localStorage) g.localStorage = shim;
  if (!g.sessionStorage) g.sessionStorage = shim;
}


function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function replaceTag(html: string, pattern: RegExp, replacement: string) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

async function main() {
  installStorageShims();
  const templatePath = resolve(distDir, "index.html");
  if (!existsSync(templatePath)) {
    console.warn("[prerender] dist/index.html not found — skipping.");
    return;
  }

  // Build a server bundle of the public routes.
  await build({
    logLevel: "warn",
    build: {
      ssr: resolve(root, "src/prerender/entry-server.tsx"),
      outDir: ssrDir,
      emptyOutDir: true,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: "entry-server.mjs" } },
    },
  });

  const mod = await import(pathToFileURL(resolve(ssrDir, "entry-server.mjs")).href);
  const routesMod = await import(pathToFileURL(resolve(root, "src/prerender/routes.ts")).href).catch(
    () => null,
  );
  const { PRERENDER_ROUTES, SITE_URL } =
    routesMod ?? (await import("../src/prerender/routes"));

  const template = readFileSync(templatePath, "utf8");
  let ok = 0;

  for (const route of PRERENDER_ROUTES) {
    try {
      const appHtml = mod.render(route.path);
      const canonical = `${SITE_URL}${route.path === "/" ? "/" : route.path}`;
      const title = escapeHtml(route.title);
      const description = escapeHtml(route.description);

      let html = template;
      html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
      html = replaceTag(
        html,
        /<meta name="description" content="[\s\S]*?">/,
        `<meta name="description" content="${description}">`,
      );
      html = replaceTag(
        html,
        /<meta property="og:title" content="[\s\S]*?">/,
        `<meta property="og:title" content="${title}">`,
      );
      html = replaceTag(
        html,
        /<meta property="og:description" content="[\s\S]*?">/,
        `<meta property="og:description" content="${description}">`,
      );
      html = replaceTag(
        html,
        /<meta name="twitter:title" content="[\s\S]*?">/,
        `<meta name="twitter:title" content="${title}">`,
      );
      html = replaceTag(
        html,
        /<meta name="twitter:description" content="[\s\S]*?">/,
        `<meta name="twitter:description" content="${description}">`,
      );
      html = replaceTag(
        html,
        /<link rel="canonical" href="[\s\S]*?" \/>/,
        `<link rel="canonical" href="${canonical}" />`,
      );
      html = replaceTag(
        html,
        /<meta property="og:url" content="[\s\S]*?" \/>/,
        `<meta property="og:url" content="${canonical}" />`,
      );
      html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);

      const outFile =
        route.path === "/"
          ? resolve(distDir, "index.html")
          : resolve(distDir, `.${route.path}/index.html`);
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, html);
      ok += 1;
    } catch (error) {
      console.warn(`[prerender] skipped ${route.path}:`, (error as Error).message);
    }
  }

  rmSync(ssrDir, { recursive: true, force: true });
  console.log(`[prerender] wrote ${ok}/${PRERENDER_ROUTES.length} static pages.`);
}

main().catch((error) => {
  // Never fail the production build because of prerendering.
  console.warn("[prerender] disabled for this build:", (error as Error).message);
});
