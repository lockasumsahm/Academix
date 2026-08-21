import { useSeo } from "@/hooks/useSeo";

const sections = [
  {
    title: "Using Academix",
    body: "Academix is a professional network for students, researchers and faculty. You must provide accurate information about yourself and keep your account credentials secure. One account per person.",
  },
  {
    title: "Your content",
    body: "You keep ownership of everything you publish. By posting, you grant Academix permission to display that content to other members as part of running the platform.",
  },
  {
    title: "Acceptable use",
    body: "No impersonation, harassment, spam, plagiarism, fabricated research, scraping, or uploading material you do not have the right to share. Professor listings must reflect real, verifiable people and affiliations.",
  },
  {
    title: "Outreach and AI",
    body: "Academix AI produces drafts and guidance, not verified facts. Check citations, deadlines and eligibility against official sources before you act on them. You are responsible for the emails you send.",
  },
  {
    title: "Availability",
    body: "The platform is provided as-is while it grows. Features may change and we may suspend accounts that break these terms.",
  },
  {
    title: "Ending your account",
    body: "You can delete your account at any time from Settings, which permanently removes your profile, publications and posts.",
  },
  {
    title: "Contact",
    body: "For anything related to these terms, email inkspire528@gmail.com.",
  },
];

const Terms = () => {
  useSeo("Terms of Service | Academix", "The rules for using the Academix research network.");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
      <h1 className="serif mt-2 text-4xl font-semibold text-primary">Terms of Service</h1>
      <p className="mt-3 text-sm text-muted-foreground">Last updated 14 August 2026</p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-base font-semibold text-primary">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};

export default Terms;
