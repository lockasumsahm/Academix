import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { STORAGE_STATE } from "./routes";




/**
 * Signs in once and saves the session so every authenticated spec reuses it.
 * Requires E2E_EMAIL / E2E_PASSWORD. Without them the authenticated specs skip
 * and only the public routes are verified.
 */
setup("authenticate", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });

  if (!email || !password) {
    // Write an empty state so dependent projects can still start.
    fs.writeFileSync(STORAGE_STATE, JSON.stringify({ cookies: [], origins: [] }));
    setup.skip(true, "E2E_EMAIL / E2E_PASSWORD not set — skipping login.");
    return;
  }

  await page.goto("/auth");
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();

  // A successful sign-in lands inside the app shell.
  await page.waitForURL(/\/(community|profile|settings)/, { timeout: 30_000 });
  await expect(page.getByRole("link", { name: /Feed/i }).first()).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE });
});
