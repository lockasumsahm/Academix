import { useSeo } from "@/hooks/useSeo";

const sections = [
  {
    title: "What we collect",
    body: "Account details you provide (name, email, university, field of study), profile content you publish, files you upload, posts and messages you send, and basic technical logs needed to keep the service running.",
  },
  {
    title: "How we use it",
    body: "To operate your account, show your profile to other researchers, deliver messages and notifications, and improve Academix. We do not sell your data and we do not run advertising on the platform.",
  },
  {
    title: "What others can see",
    body: "Your profile, publications and posts are visible to signed-in members. Your email address is never shown to other members. You control who can start a conversation with you from Settings.",
  },
  {
    title: "AI features",
    body: "Prompts you send to Academix AI are processed by our model provider to generate a response. Do not paste confidential or unpublished data you are not permitted to share.",
  },
  {
    title: "Storage and security",
    body: "Data is stored on managed infrastructure with row-level access rules, and uploaded files live in private buckets served through short-lived signed links.",
  },
  {
    title: "Your rights",
    body: "You can edit or remove your profile content at any time, and permanently delete your account and associated content from Settings. Deletion is immediate and irreversible.",
  },
  {
    title: "Contact",
    body: "Questions about privacy? Email inkspire528@gmail.com and we will respond.",
  },
];

const Privacy = () => {
  useSeo("Privacy Policy | Academix", "How Academix collects, uses and protects researcher data.");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Legal</p>
      <h1 className="serif mt-2 text-4xl font-semibold text-primary">Privacy Policy</h1>
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

export default Privacy;
