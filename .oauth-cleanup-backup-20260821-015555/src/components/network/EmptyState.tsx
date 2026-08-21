import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  /** Short, ordered guidance shown as numbered steps. */
  steps?: string[];
  action?: ReactNode;
  secondaryAction?: ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, steps, action, secondaryAction }: Props) => (
  <div className="relative overflow-hidden rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
    <div className="relative">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-secondary shadow-soft">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="serif text-lg font-semibold text-primary">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}

      {!!steps?.length && (
        <ol className="mx-auto mt-6 grid max-w-lg gap-2 text-left sm:grid-cols-3">
          {steps.map((step, i) => (
            <li key={step} className="rounded-xl border border-border bg-background/60 p-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Step {i + 1}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-foreground/80">{step}</p>
            </li>
          ))}
        </ol>
      )}

      {(action || secondaryAction) && (
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  </div>
);
