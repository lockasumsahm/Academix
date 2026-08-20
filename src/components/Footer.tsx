import { Link } from "react-router-dom";
import { Twitter, Linkedin, Github, Mail } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Research feed", to: "/community" },
      { label: "Researchers", to: "/researchers" },
      { label: "Professors", to: "/mentors" },
      { label: "Publications", to: "/publications" },
      { label: "Opportunities", to: "/opportunities" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Academix AI", to: "/ai" },
      { label: "Programs", to: "/programs" },
      { label: "FAQs", to: "/faq" },
      { label: "Support", to: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Contact", to: "/contact" },
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/40 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">A</span>
              </div>
              <span className="text-[15px] font-semibold text-primary">Academix</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The global network for student researchers. Publish your work, build your profile, and get discovered.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a href="mailto:inkspire528@gmail.com" aria-label="Email" className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" aria-label="GitHub" className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-primary mb-4">{col.title}</h3>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mb-12 rounded-2xl border border-border bg-card p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <h3 className="text-[15px] font-semibold text-primary">Stay in the loop</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                New professors, publications and research opportunities — straight to your inbox.
              </p>
            </div>
            <NewsletterSignup source="footer" />
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted-foreground">
          <p>© 2026 Academix. Provided by Inkspire HQ.</p>
          <p>Built for student researchers, worldwide.</p>
        </div>
      </div>
    </footer>
  );
};
