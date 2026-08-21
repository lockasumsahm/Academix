/**
 * Public routes rendered to static HTML at build time.
 * Titles/descriptions must match each page's useSeo() call so the static
 * markup and the hydrated app agree.
 */
export interface PrerenderRoute {
  path: string;
  title: string;
  description: string;
}

export const SITE_URL = "https://academix.inkspirehq.live";

export const PRERENDER_ROUTES: PrerenderRoute[] = [
  {
    path: "/",
    title: "Academix — The Global Network for Student Researchers",
    description:
      "Academix is the research network for students: publish your work, build a professional research profile, connect with verified professors and find research opportunities worldwide.",
  },
  {
    path: "/about",
    title: "About Academix | The Student Research Network",
    description:
      "Academix connects student researchers with professors, publications and opportunities. Learn about our mission, vision and the team behind Inkspire HQ.",
  },
  {
    path: "/features",
    title: "Features | Academix Research Network",
    description:
      "Research profiles, publications, verified professor directory, private messaging and Academix AI — everything students need to grow a research career.",
  },
  {
    path: "/programs",
    title: "Programs | Academix",
    description:
      "Academix research programs, mentorship tracks and writing initiatives for student researchers.",
  },
  {
    path: "/join",
    title: "Join Academix | Become a Student Researcher",
    description:
      "Create a free Academix profile, publish research, message professors and get discovered by universities and labs worldwide.",
  },
  {
    path: "/submit",
    title: "Submit Your Research | Academix",
    description:
      "Share your research paper, project or preprint with the Academix community and get discovered by professors and universities.",
  },
  {
    path: "/contact",
    title: "Contact Academix",
    description:
      "Get in touch with the Academix team at Inkspire HQ for support, partnerships and press.",
  },
  {
    path: "/faq",
    title: "FAQs | Academix",
    description:
      "Answers about accounts, professor listings, messaging privacy, uploads and Academix AI.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy | Academix",
    description:
      "How Academix collects, uses and protects researcher data.",
  },
  {
    path: "/terms",
    title: "Terms of Service | Academix",
    description:
      "The rules for using the Academix research network.",
  },
];
