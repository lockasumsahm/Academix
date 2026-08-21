import { createRoot } from "react-dom/client";
import "./index.css";
import { missingEnvVars } from "./lib/env";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ConfigErrorScreen } from "./components/ConfigErrorScreen";

const container = document.getElementById("root");

if (!container) {
  // Nothing we can mount to — leave a readable message rather than a blank page.
  document.body.innerHTML =
    '<p style="font-family:system-ui;padding:2rem">Academix failed to start: missing #root element.</p>';
} else {
  const root = createRoot(container);

  // Surface anything that escapes React so it reaches the console + host logs.
  window.addEventListener("error", (event) => {
    console.error("[academix:window-error]", event.error ?? event.message);
  });
  window.addEventListener("unhandledrejection", (event) => {
    console.error("[academix:unhandled-rejection]", event.reason);
  });

  const missing = missingEnvVars();

  if (missing.length > 0) {
    console.error(
      `[academix:config] Missing required public environment variables: ${missing.join(", ")}`,
    );
    root.render(<ConfigErrorScreen missing={missing} />);
  } else {
    // Imported lazily so a module-level failure inside the app (e.g. the
    // Supabase client) is caught here instead of blanking the page.
    import("./App")
      .then(({ default: App }) => {
        root.render(
          <ErrorBoundary>
            <App />
          </ErrorBoundary>,
        );
      })
      .catch((error) => {
        console.error("[academix:bootstrap] Failed to load application module", error);
        root.render(
          <ErrorBoundary>
            {/* Force the boundary into its error state with a thrown render. */}
            <BootstrapFailure />
          </ErrorBoundary>,
        );
      });
  }
}

function BootstrapFailure(): never {
  throw new Error("Application bundle failed to load");
}
