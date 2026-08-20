import { test, expect } from "@playwright/test";
import { publicRoutes } from "./routes";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("public pages", () => {
  for (const route of publicRoutes) {
    test(`renders ${route.path}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      page.on("pageerror", (e) => errors.push(e.message));

      const response = await page.goto(route.path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `HTTP status for ${route.path}`).toBeLessThan(400);

      await expect(page.locator("body")).toContainText(route.expect);
      await expect(page.locator("body")).toBeVisible();
      // The SPA must not fall through to the 404 page.
      await expect(page.locator("body")).not.toContainText(/404|Page not found/i);

      expect(errors, `console errors on ${route.path}`).toEqual([]);
    });
  }

  test("unknown route shows the not-found page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist", { waitUntil: "domcontentloaded" });
    await expect(page.locator("body")).toContainText(/404|not found/i);
  });

  test("protected route redirects signed-out visitors to sign in", async ({ page }) => {
    await page.goto("/community", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/auth/);
    await expect(page.locator("body")).toContainText(/Sign in/i);
  });
});
