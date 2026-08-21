import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Mail } from "lucide-react";

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: "Please enter your email address" })
  .email({ message: "Please enter a valid email address" })
  .max(255, { message: "Email must be less than 255 characters" });

interface NewsletterSignupProps {
  /** Where the signup happened, stored with the subscriber. */
  source: string;
  /** Visual treatment: light card (default) or on a dark/primary surface. */
  tone?: "default" | "inverted";
  className?: string;
}

export const NewsletterSignup = ({ source, tone = "default", className = "" }: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const inverted = tone === "inverted";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError(null);
    setStatus("loading");

    const { error: dbError } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data.toLowerCase(), source });

    // A duplicate email means they are already on the list — still a success for them.
    if (dbError && dbError.code !== "23505") {
      setStatus("idle");
      setError("Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setEmail("");
  };

  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          inverted
            ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground"
            : "border-accent/30 bg-accent/5 text-primary"
        } ${className}`}
      >
        <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${inverted ? "" : "text-accent"}`} />
        <div>
          <p className="text-sm font-semibold">You're subscribed.</p>
          <p className={`mt-1 text-sm ${inverted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            Thanks for joining — we'll email you when new research, professors and opportunities land on Academix.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={className} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Mail
            className={`pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 ${
              inverted ? "text-primary-foreground/50" : "text-muted-foreground"
            }`}
          />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@university.edu"
            aria-label="Email address for the Academix newsletter"
            aria-invalid={!!error}
            maxLength={255}
            className={`h-11 rounded-xl pl-9 ${
              inverted
                ? "border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50"
                : ""
            }`}
          />
        </div>
        <Button
          type="submit"
          disabled={status === "loading"}
          className={`h-11 rounded-xl px-6 font-medium ${inverted ? "bg-card text-primary hover:bg-card/90" : ""}`}
        >
          {status === "loading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Subscribe
        </Button>
      </div>
      {error && (
        <p className={`mt-2 text-xs ${inverted ? "text-primary-foreground/80" : "text-destructive"}`}>{error}</p>
      )}
    </form>
  );
};
