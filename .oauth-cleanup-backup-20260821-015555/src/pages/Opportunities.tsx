import { ArrowUpRight, Compass } from "lucide-react";
import { PageHeader } from "@/components/network/PageHeader";
import { Button } from "@/components/ui/button";
import { useSeo } from "@/hooks/useSeo";

const OPPORTUNITIES_URL = "https://opportuna.inkspirehq.live";

const Opportunities = () => {
  useSeo(
    "Opportunities | Academix",
    "Scholarships, fellowships, internships and research grants for students and academics worldwide.",
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <PageHeader
        eyebrow="Global hub"
        title="Opportunities"
        subtitle="Funded scholarships, fellowships, internships, grants and conferences — curated for researchers."
      />

      <section className="surface relative overflow-hidden p-8 text-center sm:p-12">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-[0.3] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />
        <div className="relative">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-secondary">
            <Compass className="h-6 w-6 text-primary" />
          </div>
          <h2 className="serif text-2xl font-semibold text-primary sm:text-3xl">
            Every open opportunity, in one place
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Our opportunities board is kept up to date with live deadlines and official application links.
          </p>
          <a href={OPPORTUNITIES_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="mt-8 h-12 rounded-xl px-7">
              Press here for opportunities <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Opportunities;
