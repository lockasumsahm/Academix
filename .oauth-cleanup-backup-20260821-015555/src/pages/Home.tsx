import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, ArrowUpRight, Users, FileText, Globe,
  BookOpen, Compass, Handshake, Upload, Search, MessageSquare, Award,
  Brain, Atom, Beaker, Cpu, Leaf, HeartPulse, Landmark, Palette,
  Rocket, GraduationCap, Star, Quote
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PROFESSOR_PUBLIC_COLUMNS } from "@/lib/dbColumns";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useSeo } from "@/hooks/useSeo";

/* ----------------------------------------- helpers */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const Section = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section className={`py-20 sm:py-28 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-xs font-medium text-muted-foreground mb-5">
    <span className="relative flex w-1.5 h-1.5">
      <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
      <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-accent" />
    </span>
    {children}
  </div>
);

/* Scroll-linked progress rule pinned under the nav */
const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: x }}
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left bg-accent/70"
    />
  );
};

const Reveal = ({
  children,
  delay = 0,
  lift = false,
}: { children: React.ReactNode; delay?: number; lift?: boolean }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, filter: "blur(6px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : reduce
            ? { opacity: 0 }
            : { opacity: 0, y: 28, filter: "blur(6px)" }
      }
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={lift && !reduce ? { y: -6, transition: { duration: 0.25 } } : undefined}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

/* Headline that animates in word by word */
const AnimatedHeadline = ({ children }: { children: React.ReactNode }) => {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.span
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
      className="inline"
    >
      {children}
    </motion.span>
  );
};

const Word = ({ children }: { children: React.ReactNode }) => (
  <motion.span
    variants={{
      hidden: { opacity: 0, y: "0.5em", filter: "blur(8px)" },
      show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
    }}
    className="inline-block"
  >
    {children}
  </motion.span>
);


const CountUp = ({ to, suffix = "" }: { to: number; suffix?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.floor(eased * to));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, to]);
  return <span ref={ref}>{n.toLocaleString()}{suffix}</span>;
};

/* ----------------------------------------- data */

const whyCards = [
  {
    icon: Upload,
    title: "Publish",
    body: "Turn your research into a public, citable record. Upload papers and projects, track views and downloads, and share one clean link.",
  },
  {
    icon: Compass,
    title: "Discover",
    body: "AI-matched papers, opportunities, and professors aligned to your field, methods, and research DNA.",
  },
  {
    icon: Handshake,
    title: "Collaborate",
    body: "Find co-authors, join labs, and build long-term research partnerships across universities and continents.",
  },
];

const steps = [
  { title: "Create your profile", body: "Build a scholarly identity in under 5 minutes." },
  { title: "Add your research", body: "Upload papers, projects, and ongoing work." },
  { title: "Get matched", body: "AI surfaces professors, collaborators, and opportunities." },
  { title: "Publish & cite", body: "Version, peer-review, and share with a permanent link." },
  { title: "Grow your network", body: "Endorsements, follows, and invitations — worldwide." },
];

const fields = [
  { icon: Cpu, name: "Computer Science" },
  { icon: Atom, name: "Physics" },
  { icon: Beaker, name: "Chemistry" },
  { icon: HeartPulse, name: "Medicine" },
  { icon: Brain, name: "Neuroscience" },
  { icon: Leaf, name: "Environmental" },
  { icon: Landmark, name: "Economics" },
  { icon: Palette, name: "Humanities" },
];

/* ----------------------------------------- live data */

type Prof = {
  id: string;
  full_name: string;
  department: string;
  research_areas: string[] | null;
  accepting_students: boolean | null;
  universities: { name: string; country: string } | null;
};

type Opp = {
  id: string;
  title: string;
  organization: string;
  category: string;
  country: string | null;
  official_link: string | null;
};

const useNetworkData = () => {
  const [counts, setCounts] = useState({
    members: 0,
    publications: 0,
    professors: 0,
    universities: 0,
    countries: 0,
    accepting: 0,
    opportunities: 0,
  });
  const [professors, setProfessors] = useState<Prof[]>([]);
  const [opportunities, setOpportunities] = useState<Opp[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [stats, featured, opps] = await Promise.all([
        supabase.functions.invoke("platform-stats", { method: "POST" }),
        supabase
          .from("professors")
          .select(`${PROFESSOR_PUBLIC_COLUMNS}, universities(name, country)`)
          .eq("accepting_students", true)
          .limit(4),
        supabase
          .from("opportunities")
          .select("id, title, organization, category, country, official_link")
          .eq("status", "open")
          .order("created_at", { ascending: false })
          .limit(3),
      ]);
      if (!active) return;
      const s = (stats.data ?? null) as Record<string, number> | null;
      setCounts({
        members: Number(s?.members ?? 0),
        publications: Number(s?.publications ?? 0),
        professors: Number(s?.professors ?? 0),
        universities: Number(s?.universities ?? 0),
        countries: Number(s?.university_countries ?? 0),
        accepting: Number(s?.accepting_professors ?? 0),
        opportunities: Number(s?.open_opportunities ?? 0),
      });
      setProfessors((featured.data ?? []) as unknown as Prof[]);
      setOpportunities((opps.data ?? []) as Opp[]);
    })();
    return () => { active = false; };
  }, []);

  return { counts, professors, opportunities };
};

/* ----------------------------------------- page */

const Home = () => {
  useSeo(
    "Academix — The Global Network for Student Researchers",
    "Academix is the research network for students: publish your work, build a professional research profile, connect with verified professors and find research opportunities worldwide.",
  );

  const { counts, professors, opportunities } = useNetworkData();
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const copyY = useTransform(heroProgress, [0, 1], ["0%", reduce ? "0%" : "-12%"]);
  const copyOpacity = useTransform(heroProgress, [0, 0.8], [1, reduce ? 1 : 0.25]);

  const stats = [
    { value: counts.professors, label: "Verified professors" },
    { value: counts.universities, label: "Universities indexed" },
    { value: counts.countries, label: "Countries represented" },
    
  ];

  return (
    <div className="bg-background">
      <ScrollProgress />

      {/* HERO */}
      <section ref={heroRef} className="relative overflow-hidden">
        <motion.div
          className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 1.2 }}
        />
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/3 h-72 w-72 rounded-full bg-accent/10 blur-3xl motion-safe:animate-float"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-20 sm:pb-32 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="min-w-0 lg:col-span-7">
              <motion.div style={{ y: copyY, opacity: copyOpacity }} initial="hidden" animate="show" variants={fadeUp}>
                <Eyebrow>Now in beta · Join the founding class</Eyebrow>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-primary leading-[1.05]">
                  <AnimatedHeadline>
                    <Word>The</Word>{" "}
                    <Word>global</Word>{" "}
                    <Word>network</Word>{" "}
                    <Word>for</Word>{" "}
                    <Word>
                      <span className="serif italic font-normal text-accent">student researchers</span>.
                    </Word>
                  </AnimatedHeadline>
                </h1>
                <motion.p
                  className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 }}
                >
                  Publish your research, build a professional academic profile, and get discovered by professors, labs, and universities — worldwide.
                </motion.p>
                <motion.div
                  className="mt-8 flex flex-col sm:flex-row gap-3"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.65 }}
                >
                  <Link to="/auth">
                    <Button size="lg" className="group rounded-xl h-12 px-6 text-[15px] font-medium w-full sm:w-auto transition-transform duration-200 hover:-translate-y-0.5">
                      Create your profile
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link to="/mentors">
                    <Button size="lg" variant="outline" className="rounded-xl h-12 px-6 text-[15px] font-medium w-full sm:w-auto border-border transition-transform duration-200 hover:-translate-y-0.5">
                      Explore research
                    </Button>
                  </Link>
                </motion.div>
                <motion.dl
                  className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-border pt-6 sm:gap-6"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.1, delayChildren: 0.8 } } }}
                >
                  {[
                    { k: "Professors", v: counts.professors },
                    { k: "Universities", v: counts.universities },
                    { k: "Countries", v: counts.countries },
                  ].map((x) => (
                    <motion.div
                      key={x.k}
                      className="min-w-0"
                      variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }}
                    >
                      <dt className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground sm:text-[11px] sm:tracking-[0.14em]">{x.k}</dt>
                      <dd className="mt-1 text-2xl font-semibold tabular-nums text-primary">
                        <CountUp to={x.v} />
                      </dd>
                    </motion.div>
                  ))}
                </motion.dl>
              </motion.div>
            </div>

            <motion.div
              className="relative min-w-0 lg:col-span-5"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative rounded-3xl overflow-hidden shadow-floating border border-border bg-card">
                <div className="px-6 pt-6 pb-4 border-b border-border">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Featured in the directory</p>
                  <p className="mt-1 text-[15px] font-semibold text-primary">
                    Browse professors by field and email them directly
                  </p>
                </div>
                <ul className="divide-y divide-border">
                  {professors.map((p, i) => (
                    <motion.li
                      key={p.id}
                      className="flex items-center gap-4 px-6 py-4"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
                    >
                      <div className="w-11 h-11 rounded-full bg-primary/10 border border-border flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                        {p.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {p.department}{p.universities?.name ? ` · ${p.universities.name}` : ""}
                        </p>
                      </div>

                    </motion.li>
                  ))}
                </ul>
                <Link to="/mentors" className="block border-t border-border">
                  <div className="flex items-center justify-between px-6 py-4 text-sm font-medium text-primary hover:bg-secondary/50 transition-colors">
                    Explore all mentors
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>




      {/* WHY ACADEMIX */}
      <Section>
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>Why Academix</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
              Everything a young researcher needs, <span className="serif italic font-normal text-muted-foreground">in one place</span>.
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {whyCards.map((c, i) => (
            <Reveal key={c.title} delay={i * 0.08} lift>
              <div className="card-lift h-full p-8 rounded-2xl border border-border bg-card">
                <div className="w-11 h-11 rounded-xl bg-primary/5 flex items-center justify-center mb-6">
                  <c.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-primary">{c.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section className="bg-secondary/40 border-y border-border">
        <Reveal>
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
              From first draft to global recognition.
            </h2>
          </div>
        </Reveal>
        <div className="mt-14 relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-px bg-border" />
          <div className="grid md:grid-cols-5 gap-8">
            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-background border border-border flex items-center justify-center text-sm font-semibold text-primary relative z-10">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold text-primary">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* PROFESSOR DIRECTORY — live */}
      <Section>
        <div className="flex items-end justify-between mb-10 gap-6">
          <Reveal>
            <div>
              <Eyebrow>From the directory</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
                Find professors by <span className="serif italic font-normal">research field</span>.
              </h2>
            </div>
          </Reveal>
          <Link to="/mentors" className="hidden sm:inline-flex items-center text-sm font-medium text-primary hover:opacity-70 transition-opacity">
            Browse all <ArrowUpRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
        {professors.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {professors.map((r, i) => (
              <Reveal key={r.id} delay={i * 0.06} lift>
                <Link to={`/mentor/${r.id}`} className="card-lift block h-full rounded-2xl border border-border bg-card p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {r.full_name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]).join("")}
                  </div>
                  <h3 className="mt-5 text-[15px] font-semibold text-primary leading-snug">{r.full_name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{r.universities?.name}</p>
                  <p className="mt-4 text-sm text-foreground/80">{r.department}</p>
                  {!!r.research_areas?.length && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {r.research_areas.slice(0, 2).map((a) => (
                        <span key={a} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">{a}</span>
                      ))}
                    </div>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
            <p className="text-sm text-muted-foreground">The professor directory is loading. Browse the full list to search by field, university and country.</p>
            <Link to="/mentors"><Button variant="outline" className="mt-5 rounded-xl">Open the directory</Button></Link>
          </div>
        )}
      </Section>

      {/* OPEN OPPORTUNITIES */}
      <Section className="bg-secondary/40 border-y border-border">
        <Reveal>
          <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="max-w-xl">
              <Eyebrow>Open opportunities</Eyebrow>
              <h2 className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
                Real programmes, <span className="serif italic font-normal">real deadlines</span>.
              </h2>
              <p className="mt-5 text-sm text-muted-foreground leading-relaxed">
                Scholarships, fellowships, internships and research grants — curated and updated as they open.
              </p>
            </div>
            <div className="lg:ml-auto">
              <Link to="/opportunities">
                <Button size="lg" className="rounded-xl h-12 px-6">
                  Press here for opportunities <ArrowUpRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </Section>


      {/* RESEARCH OPPORTUNITIES BANNER */}
      <Section>
        <Reveal>
          <div className="rounded-3xl border border-border bg-gradient-to-br from-secondary/60 to-background p-10 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <Eyebrow>Research opportunities</Eyebrow>
              <h3 className="text-2xl sm:text-3xl font-semibold text-primary tracking-tight">
                Weekly matched opportunities, delivered to your inbox.
              </h3>
              <p className="mt-3 text-sm text-muted-foreground">
                REUs, summer programs, RAships, and lab openings — filtered to your field, level, and location.
              </p>
            </div>
            <Link to="/auth"><Button size="lg" className="rounded-xl h-12 px-6">Get matched <ArrowRight className="ml-2 w-4 h-4" /></Button></Link>
          </div>
        </Reveal>
      </Section>

      {/* RESEARCH FIELDS */}
      <Section className="bg-secondary/40 border-y border-border">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Eyebrow>Every field</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
              Wherever your curiosity leads.
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {fields.map((f, i) => (
            <Reveal key={f.name} delay={i * 0.04} lift>
              <Link to="/mentors" className="card-lift group flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                  <f.icon className="w-5 h-5 text-primary group-hover:text-accent transition-colors" />
                </div>
                <span className="text-sm font-medium text-primary">{f.name}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* PRINCIPLES */}
      <Section>
        <Reveal>
          <div className="max-w-2xl mb-12">
            <Eyebrow>How we operate</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-semibold text-primary tracking-tight">
              An academic record you can <span className="serif italic font-normal">stand behind</span>.
            </h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { t: "No invented metrics", b: "Every number on Academix is counted from the live database. Empty means empty — we never pad the platform with sample profiles or fake engagement." },
            { t: "Sourced professor data", b: "Each professor entry links to an official university profile, Google Scholar or ResearchGate page so you can verify it before you write." },
            { t: "Your work stays yours", b: "Uploads are stored privately by default. You choose what appears on your public profile, and you can remove it at any time." },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.06} lift>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <Quote className="w-5 h-5 text-muted-foreground" />
                <h3 className="mt-5 text-[15px] font-semibold text-primary">{c.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>


      {/* FINAL CTA */}
      <Section>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-12 md:p-20 text-center">
            <div className="absolute inset-0 opacity-10 grid-bg" />
            <div className="relative max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight">
                Your research deserves <span className="serif italic font-normal">an audience</span>.
              </h2>
              <p className="mt-5 text-primary-foreground/70 text-lg">
                Join the founding class of Academix and start building your academic future today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/auth">
                  <Button size="lg" className="bg-card text-primary hover:bg-card/90 rounded-xl h-12 px-6 font-medium">
                    Create your profile <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/mentors">
                  <Button size="lg" variant="outline" className="rounded-xl h-12 px-6 border-primary-foreground/20 text-primary-foreground hover:bg-card/10">
                    Explore first
                  </Button>
                </Link>
              </div>

              <div className="mx-auto mt-12 max-w-md border-t border-primary-foreground/15 pt-8 text-left">
                <p className="mb-3 text-center text-sm text-primary-foreground/70">
                  Or get the Academix newsletter — new professors, publications and opportunities.
                </p>
                <NewsletterSignup source="home" tone="inverted" />
              </div>
            </div>
          </div>
        </Reveal>
      </Section>

    </div>
  );
};

export default Home;
