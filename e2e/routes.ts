export interface RouteCheck {
  /** Path to visit. */
  path: string;
  /** Text that must be visible once the page has rendered. */
  expect: RegExp;
  /** Requires an authenticated session. */
  auth?: boolean;
}

/** Public marketing pages — must render for signed-out visitors. */
export const publicRoutes: RouteCheck[] = [
  { path: "/", expect: /Academix/i },
  { path: "/about", expect: /About|mission/i },
  { path: "/contact", expect: /Contact/i },
  { path: "/faq", expect: /Frequently|FAQ/i },
  { path: "/privacy", expect: /Privacy/i },
  { path: "/terms", expect: /Terms/i },
  { path: "/auth", expect: /Sign in|Create account/i },
  { path: "/mentors", expect: /Research Mentor Finder/i },
  { path: "/opportunities", expect: /Opportunities/i },
];

/** Application pages behind the sign-in wall. */
export const authedRoutes: RouteCheck[] = [
  { path: "/community", expect: /Publish|Feed|research/i, auth: true },
  { path: "/researchers", expect: /Researchers/i, auth: true },
  { path: "/publications", expect: /Publications/i, auth: true },
  { path: "/ai", expect: /Academix AI/i, auth: true },
  { path: "/messages", expect: /Messages|conversation/i, auth: true },
  { path: "/notifications", expect: /Notifications/i, auth: true },
  { path: "/profile", expect: /Profile|Edit profile/i, auth: true },
  { path: "/settings", expect: /Settings/i, auth: true },
  { path: "/mentors", expect: /professors found|Research Mentor Finder/i, auth: true },
  { path: "/opportunities", expect: /Opportunities/i, auth: true },
];

/** Sidebar destinations every signed-in member must be able to reach. */
export const sidebarLinks = [
  "Feed",
  "Researchers",
  "Professors",
  "Publications",
  "Opportunities",
  "Messages",
  "Academix AI",
  "Notifications",
];

import path from "node:path";

/** Where the signed-in session is cached by auth.setup.ts. */
export const STORAGE_STATE = path.join(process.cwd(), "e2e/.auth/user.json");
