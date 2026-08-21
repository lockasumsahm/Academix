import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { useSeo } from "@/hooks/useSeo";

const faqs = [
  {
    q: "What is Academix?",
    a: "A professional network for student researchers, academics and faculty: a verified professor directory, a research feed, publication hosting, direct messaging, and an AI research assistant.",
  },
  {
    q: "Is it free?",
    a: "Yes. Creating an account, publishing work, messaging researchers and using Academix AI are free while the platform is in public release.",
  },
  {
    q: "Who can join?",
    a: "Anyone doing or preparing for research — high-school researchers, undergraduates, graduate students, and professors. Choose Student or Professor when you sign up.",
  },
  {
    q: "How do professor listings work?",
    a: "The directory indexes publicly available faculty information. If a listing is yours, sign up with a professor account and publish your own listing from Settings so it reflects your current lab and availability.",
  },
  {
    q: "Can I control who messages me?",
    a: "Yes. In Settings you can allow messages from anyone on Academix, or restrict new conversations to people you follow.",
  },
  {
    q: "Are my uploads public?",
    a: "Files live in private storage and are served through short-lived signed links to signed-in members. Your email address is never shown to other members.",
  },
  {
    q: "Is Academix AI reliable for citations?",
    a: "Treat it as a drafting and planning partner. It will not invent references on request, but you should always verify sources, deadlines and eligibility on official pages.",
  },
  {
    q: "How do I delete my account?",
    a: "Settings → Danger zone → Delete account. This permanently removes your profile, publications, posts and uploaded files.",
  },
];

const Faq = () => {
  useSeo("FAQs | Academix", "Answers about accounts, professor listings, messaging privacy, uploads and Academix AI.");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Support</p>
      <h1 className="serif mt-2 text-4xl font-semibold text-primary">Frequently asked questions</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
        Everything you need to know before you build your research profile.
      </p>

      <Accordion type="single" collapsible className="mt-10">
        {faqs.map((f) => (
          <AccordionItem key={f.q} value={f.q}>
            <AccordionTrigger className="text-left text-sm font-semibold text-primary">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm leading-relaxed text-foreground/80">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-10 flex flex-wrap gap-2">
        <Link to="/auth"><Button className="rounded-lg">Create your profile</Button></Link>
        <Link to="/contact"><Button variant="outline" className="rounded-lg">Still need help?</Button></Link>
      </div>
    </div>
  );
};

export default Faq;
