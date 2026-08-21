interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export const PageHeader = ({ eyebrow, title, subtitle, children }: Props) => (
  <header className="mb-8">
    {eyebrow && (
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2">
        {eyebrow}
      </p>
    )}
    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary">{title}</h1>
    {subtitle && <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">{subtitle}</p>}
    {children && <div className="mt-5">{children}</div>}
  </header>
);
