# End-to-end tests

Playwright suite that signs in and verifies every main page renders on each deployment.

## What it covers

- **Public pages** (`public-pages.spec.ts`) — home, about, contact, FAQ, privacy, terms, sign-in, professors, opportunities. Asserts real content, no 404 fallthrough, and zero console errors. Also checks the not-found page and that protected routes bounce signed-out visitors to sign in.
- **Signed-in pages** (`app-pages.spec.ts`) — Feed, Researchers, Publications, Academix AI, Messages, Notifications, Profile, Settings, Professors, Opportunities. Asserts each page renders (no redirect back to sign in), every sidebar destination is reachable, and directory data loads from the backend.

## Running locally

```bash
npm run test:e2e            # public pages only
E2E_EMAIL=... E2E_PASSWORD=... npm run test:e2e   # includes signed-in pages
npm run test:e2e:ui         # interactive
```

The config starts the dev server automatically for `localhost`. To test a deployed build:

```bash
E2E_BASE_URL=https://academix.inkspirehq.live npm run test:e2e
```

## Credentials

Use a **dedicated test account** — the suite reuses one session and auth refresh tokens rotate, so sharing the account with a live browser session will sign the tests out mid-run.

| Variable | Purpose |
| --- | --- |
| `E2E_EMAIL` / `E2E_PASSWORD` | Test member login. Without them the signed-in specs skip. |
| `E2E_BASE_URL` | Target URL (defaults to `http://localhost:8080`). |
| `PW_CHROMIUM_PATH` | Optional: use a preinstalled Chromium binary. |

## CI

`.github/workflows/e2e.yml` runs the suite on every push and pull request, plus a daily run against the deployed URL. Add `E2E_EMAIL` / `E2E_PASSWORD` as repository secrets and `E2E_BASE_URL` as a repository variable pointing at the live site. The HTML report is uploaded as a build artifact.

## Adding a page

Add it to `routes.ts` — nothing else to change.
