import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";
import { authedRoutes, sidebarLinks, STORAGE_STATE } from "./routes";
import { gotoAuthed } from "./session";

const hasSession = () => {
  if (!fs.existsSync(STORAGE_STATE)) return false;
  const state = JSON.parse(fs.readFileSync(STORAGE_STATE, "utf8"));
  return (state.origins ?? []).length > 0 || (state.cookies ?? []).length > 0;
};

/**
 * One browser context for the whole file: the auth session refresh-token
 * rotates, so parallel contexts sharing a saved session would sign each other
 * out. Serial mode keeps a single, stable session.
 */
test.describe.configure({ mode: "serial" });

test.describe("signed-in app pages", () => {
  test.skip(() => !hasSession(), "No test session — set E2E_EMAIL / E2E_PASSWORD.");

  let page: Page;
  let errors: string[] = [];

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    page = await context.newPage();
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    page.on("pageerror", (e) => errors.push(e.message));
  });

  test.afterAll(async () => {
    await page?.context().close();
  });

  test.beforeEach(() => {
    errors = [];
  });

  for (const route of authedRoutes) {
    test(`renders ${route.path}`, async () => {
      await gotoAuthed(page, route.path);
      await expect(page.locator("body")).toContainText(route.expect);
      await expect(page.locator("body")).not.toContainText(/Page not found/i);

      expect(errors, `console errors on ${route.path}`).toEqual([]);
    });
  }

  test("every main destination is reachable from the navigation", async () => {
    await gotoAuthed(page, "/community");
    for (const label of sidebarLinks) {
      await expect(page.getByRole("link", { name: label }).first()).toBeVisible();
    }
  });

  test("directory and mentor data load from the backend", async () => {
    await gotoAuthed(page, "/mentors");
    await expect(page.locator("body")).toContainText(/professors found/i);

    await gotoAuthed(page, "/researchers");
    await expect(page.getByRole("heading", { name: /Researchers/i }).first()).toBeVisible();
  });
});
