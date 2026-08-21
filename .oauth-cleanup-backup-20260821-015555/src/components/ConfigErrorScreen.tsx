import { isDev } from "@/lib/env";

/**
 * Rendered when required public configuration is missing. Developers see the
 * exact variable names; production visitors see a neutral service message with
 * no infrastructure details.
 */
export const ConfigErrorScreen = ({ missing }: { missing: string[] }) => (
  <div className="min-h-dvh flex items-center justify-center bg-background px-6 py-16">
    <div className="w-full max-w-md text-center">
      <p className="font-serif text-2xl tracking-tight text-foreground">Academix</p>
      <h1 className="mt-6 font-serif text-3xl text-foreground">
        {isDev ? "Configuration incomplete" : "Academix is temporarily unavailable"}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        {isDev
          ? "The app cannot start because required public environment variables are missing."
          : "We could not start the application. Please try again in a few minutes."}
      </p>

      {isDev && (
        <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4 text-left">
          <p className="text-xs font-medium text-foreground">Missing variables</p>
          <ul className="mt-2 space-y-1 font-mono text-xs text-muted-foreground">
            {missing.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Add them to <span className="font-mono">.env</span> locally, or to your hosting
            provider’s environment settings, then rebuild. See DEPLOYMENT.md.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Reload
      </button>
    </div>
  </div>
);

export default ConfigErrorScreen;
