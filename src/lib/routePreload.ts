// Central registry of route -> dynamic import so we can preload chunks
// before the user actually navigates (hover / touch / idle).

type Loader = () => Promise<unknown>;

export const routeLoaders: Record<string, Loader> = {
  "/about": () => import("@/pages/About"),
  "/programs": () => import("@/pages/Programs"),
  "/submit": () => import("@/pages/Submit"),
  "/features": () => import("@/pages/Features"),
  "/join": () => import("@/pages/JoinUs"),
  "/contact": () => import("@/pages/Contact"),
  "/faq": () => import("@/pages/Faq"),
  "/privacy": () => import("@/pages/Privacy"),
  "/terms": () => import("@/pages/Terms"),
  "/auth": () => import("@/pages/Auth"),
  "/community": () => import("@/pages/Community"),
  "/researchers": () => import("@/pages/Researchers"),
  "/publications": () => import("@/pages/Publications"),
  "/opportunities": () => import("@/pages/Opportunities"),
  "/messages": () => import("@/pages/Messages"),
  "/ai": () => import("@/pages/AcademixAI"),
  "/notifications": () => import("@/pages/Notifications"),
  "/settings": () => import("@/pages/Settings"),
  "/profile": () => import("@/pages/Profile"),
  "/mentors": () => import("@/pages/MentorFinder"),
};

const dynamicLoaders: Array<[RegExp, Loader]> = [
  [/^\/researcher\/[^/]+$/, () => import("@/pages/ResearcherProfile")],
  [/^\/mentor\/[^/]+\/email$/, () => import("@/pages/EmailGenerator")],
  [/^\/mentor\/[^/]+$/, () => import("@/pages/ProfessorProfile")],
];

const aliases: Record<string, string> = {
  "/academix-ai": "/ai",
  "/assistant": "/ai",
  "/feed": "/community",
  "/login": "/auth",
  "/signup": "/auth",
  "/register": "/auth",
  "/mentor-finder": "/mentors",
  "/professors": "/mentors",
};

const started = new Set<string>();

export function preloadRoute(rawPath: string) {
  if (!rawPath) return;
  const path = (aliases[rawPath] ?? rawPath).replace(/\/+$/, "") || "/";
  if (started.has(path)) return;

  const loader =
    routeLoaders[path] ?? dynamicLoaders.find(([re]) => re.test(path))?.[1];
  if (!loader) return;

  started.add(path);
  loader().catch(() => started.delete(path));
}

/** Preload the most likely next destinations once the browser is idle. */
export function preloadLikelyRoutes(paths: string[]) {
  const run = () => paths.forEach(preloadRoute);
  if (typeof window === "undefined") return;
  const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number })
    .requestIdleCallback;
  if (ric) ric(run);
  else window.setTimeout(run, 1200);
}
