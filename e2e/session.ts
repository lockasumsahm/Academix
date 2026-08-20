import { expect, type Page } from "@playwright/test";

/** Signs in through the UI with the credentials from the environment. */
export const signIn = async (page: Page) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) return false;

  await page.goto("/auth", { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).first().fill(email);
  await page.getByLabel(/password/i).first().fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  await page.waitForURL(/\/(community|profile|settings)/, { timeout: 30_000 });
  return true;
};

/**
 * Navigates to a route as a signed-in member. If the saved session has expired
 * mid-run the helper signs in again once and retries, so token rotation never
 * turns into a flaky failure.
 */
export const gotoAuthed = async (page: Page, path: string) => {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  if (/\/auth/.test(page.url())) {
    const recovered = await signIn(page);
    expect(recovered, "session expired and no credentials available to sign in again").toBe(true);
    await page.goto(path, { waitUntil: "domcontentloaded" });
  }
  await expect(page).not.toHaveURL(/\/auth/);
};
