import { Component, ReactNode, ErrorInfo } from "react";
import { isDev } from "@/lib/env";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string;
  message: string;
}

function makeErrorId() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

/**
 * Application-wide error boundary. A crash renders a branded Academix screen
 * instead of a blank page. Technical details are logged to the console (and
 * therefore to deployment log drains) but never rendered for end users in
 * production.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, errorId: "", message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorId: makeErrorId(), message: error?.message ?? "Unknown error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Structured, greppable log for browser console + hosting logs.
    console.error(`[academix:error ${this.state.errorId}]`, error, info?.componentStack);
  }

  private reload = () => window.location.reload();
  private goHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-dvh flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-md text-center">
          <p className="font-serif text-2xl tracking-tight text-foreground">Academix</p>
          <h1 className="mt-6 font-serif text-3xl text-foreground">Something went wrong</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            An unexpected error stopped this page from loading. Your data is safe — reloading
            usually fixes it.
          </p>

          {isDev && (
            <pre className="mt-6 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-3 text-left text-xs text-muted-foreground">
              {this.state.message}
            </pre>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            Reference: <span className="font-mono">{this.state.errorId}</span>
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={this.reload}
              className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Reload
            </button>
            <button
              type="button"
              onClick={this.goHome}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Go home
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
