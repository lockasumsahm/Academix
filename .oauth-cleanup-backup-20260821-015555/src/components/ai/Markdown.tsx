import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders assistant markdown with typographic styles matched to the app theme. */
export const Markdown = ({ children }: { children: string }) => (
  <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h3 className="mt-4 text-base font-semibold text-primary">{children}</h3>,
        h2: ({ children }) => <h3 className="mt-4 text-base font-semibold text-primary">{children}</h3>,
        h3: ({ children }) => <h4 className="mt-3 text-sm font-semibold text-primary">{children}</h4>,
        p: ({ children }) => <p className="leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="ml-5 list-disc space-y-1.5">{children}</ul>,
        ol: ({ children }) => <ol className="ml-5 list-decimal space-y-1.5">{children}</ol>,
        li: ({ children }) => <li className="pl-1">{children}</li>,
        strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
        a: ({ children, href }) => (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-2">
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent/50 pl-3 italic text-muted-foreground">{children}</blockquote>
        ),
        hr: () => <hr className="border-border" />,
        code: ({ className, children }) =>
          className ? (
            <code className="block overflow-x-auto rounded-lg bg-secondary/70 p-3 font-mono text-[13px]">{children}</code>
          ) : (
            <code className="rounded bg-secondary/70 px-1.5 py-0.5 font-mono text-[13px]">{children}</code>
          ),
        pre: ({ children }) => <pre className="overflow-x-auto">{children}</pre>,
        table: ({ children }) => (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-secondary/60 text-left">{children}</thead>,
        th: ({ children }) => <th className="px-3 py-2 font-semibold text-primary">{children}</th>,
        td: ({ children }) => <td className="border-t border-border px-3 py-2 align-top">{children}</td>,
      }}
    >
      {children}
    </ReactMarkdown>
  </div>
);
