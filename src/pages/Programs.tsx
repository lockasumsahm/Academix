import { Button } from "@/components/ui/button";
import { GraduationCap, Feather, BookOpen, CheckCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useSeo } from "@/hooks/useSeo";

const Programs = () => {
  useSeo(
    "Programs | Academix",
    "Academix research programs, mentorship tracks and writing initiatives for student researchers.",
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">Our Programs</h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Three pathways to academic excellence and creative expression
          </p>
        </div>
      </section>

      {/* CV Growth Program */}
      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl font-bold">🎓 CV Growth</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Build a compelling academic profile that stands out to universities and employers. Our CV Growth program helps you develop professional credentials through published work and recognized achievements.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Get published work for your portfolio",
                  "Earn official certificates of recognition",
                  "Learn professional writing standards",
                  "Network with academic peers globally"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/submit">
                <Button className="bg-primary hover:bg-primary/90">
                  Start Building Your CV
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-8 md:p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <GraduationCap className="w-32 h-32 text-primary/20 mx-auto mb-4" />
                <p className="text-muted-foreground italic">
                  "Professional development through academic achievement"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Poetry & Expression */}
      <section className="py-16 md:py-20 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-card/50 rounded-2xl p-8 md:p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <Feather className="w-32 h-32 text-accent/20 mx-auto mb-4" />
                <p className="text-muted-foreground italic">
                  "Where words paint worlds and emotions take flight"
                </p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Feather className="w-6 h-6 text-accent" />
                </div>
                <h2 className="font-serif text-3xl font-bold">🖋️ Poetry & Expression</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Share your creative voice with the world. Our poetry and creative writing platform celebrates original expression and gives emerging writers a space to be heard.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Showcase your creative writing",
                  "Connect with fellow poets and writers",
                  "Get featured in our publications",
                  "Receive constructive feedback"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/submit">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Submit Your Poetry
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Student Research */}
      <section className="py-16 md:py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl font-bold">📚 Student Research</h2>
              </div>
              <p className="text-lg text-muted-foreground mb-6">
                Get your research recognized in our academic community. We help students publish quality research papers that contribute to their field and establish their credibility as emerging scholars.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Publish original research papers",
                  "Peer review and feedback process",
                  "Official publication certificates",
                  "Academic recognition and credibility"
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link to="/submit">
                <Button className="bg-primary hover:bg-primary/90">
                  Submit Your Research
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="bg-secondary/50 rounded-2xl p-8 md:p-12 h-full flex items-center justify-center">
              <div className="text-center">
                <BookOpen className="w-32 h-32 text-primary/20 mx-auto mb-4" />
                <p className="text-muted-foreground italic">
                  "Transforming curiosity into knowledge"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Choose your path and begin building your academic legacy today
          </p>
          <Link to="/submit">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
              Submit Your Work Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Programs;
