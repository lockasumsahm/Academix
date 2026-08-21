import { useEffect, useState } from "react";
import { Target, Eye, Sparkles, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";

const About = () => {
  useSeo(
    "About Academix | The Student Research Network",
    "Academix connects student researchers with professors, publications and opportunities. Learn about our mission, vision and the team behind Inkspire HQ.",
  );

  const [stats, setStats] = useState({ professors: 0, universities: 0, countries: 0 });

  useEffect(() => {
    let active = true;
    (async () => {
      const [profCount, uniRows] = await Promise.all([
        supabase.from("professors").select("id", { count: "exact", head: true }),
        supabase.from("universities").select("country"),
      ]);
      if (!active) return;
      setStats({
        professors: profCount.count ?? 0,
        universities: uniRows.data?.length ?? 0,
        countries: new Set((uniRows.data ?? []).map((u) => u.country).filter(Boolean)).size,
      });
    })();
    return () => { active = false; };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">About Inkspire HQ</h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Empowering students globally through creative and academic expression
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-6 h-6 text-accent" />
            <h2 className="font-serif text-3xl font-bold">Our Story</h2>
          </div>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Founded by <span className="font-semibold text-foreground">Abdullah Amir</span>, Inkspire HQ was born from a simple yet powerful vision: to create a platform where students worldwide could transform their ideas into lasting impact.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              We believe that every student has unique insights worth sharing. Whether it's groundbreaking research, moving poetry, or innovative ideas — these contributions deserve recognition and a platform to inspire others.
            </p>
            <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
              <p className="font-serif text-xl italic text-foreground">
                "I started Inkspire HQ to give students the chance to be recognized — not just in classrooms, but in the world."
              </p>
              <p className="text-sm text-muted-foreground mt-2">— Abdullah Amir, Founder</p>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed mt-6">
              Our motto: <span className="font-semibold text-foreground">"Inspiring Minds Through Ink & Ideas"</span> — a guiding principle that shapes everything we do.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-card p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">
                To encourage student expression, creativity, and academic growth by providing a supportive platform for research publication, creative writing, and professional development. We're committed to helping students build portfolios that open doors to future opportunities.
              </p>
            </div>

            <div className="bg-card p-8 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Eye className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">
                To build a global network of student researchers and writers who inspire each other and contribute to the collective knowledge of humanity. We envision a world where student voices are amplified and their contributions are celebrated worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="w-6 h-6 text-accent" />
              <h2 className="font-serif text-3xl font-bold">Our Impact</h2>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { v: stats.professors, label: "Professors in the directory" },
              { v: stats.universities, label: "Universities indexed" },
              { v: stats.countries, label: "Countries represented" },
            ].map((s) => (
              <div key={s.label} className="p-6">
                <div className="text-4xl font-serif font-bold text-primary mb-2 tabular-nums">{s.v.toLocaleString()}</div>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-muted-foreground">
            Counted live from the Academix database — no estimates.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: "Creativity", description: "We celebrate unique perspectives and original thinking" },
              { value: "Growth", description: "We foster continuous learning and development" },
              { value: "Authenticity", description: "We value genuine expression and honest work" },
              { value: "Impact", description: "We measure success by the change we create" }
            ].map((item, index) => (
              <div key={index} className="bg-card p-6 rounded-lg text-center">
                <h3 className="font-serif text-xl font-bold mb-2 text-primary">{item.value}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl font-bold mb-8">Meet the Founder</h2>
          <div className="bg-secondary p-8 rounded-xl">
            <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-6 flex items-center justify-center">
              <span className="text-4xl font-serif text-primary-foreground">AA</span>
            </div>
            <h3 className="font-serif text-2xl font-bold mb-2">Abdullah Amir</h3>
            <p className="text-accent font-medium mb-4">Founder & Director</p>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A passionate advocate for student empowerment and academic excellence, Abdullah founded Inkspire HQ to create opportunities for students worldwide to share their work and build meaningful academic portfolios.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
