import { Mail, Instagram, MapPin, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSeo } from "@/hooks/useSeo";

const Contact = () => {
  useSeo(
    "Contact Academix",
    "Get in touch with the Academix team at Inkspire HQ for support, partnerships and press.",
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">Get in Touch</h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            We'd love to hear from you. Reach out with questions, ideas, or collaboration opportunities.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Email */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-2">Email Us</h3>
                    <p className="text-muted-foreground mb-3">
                      For submissions, inquiries, or general questions
                    </p>
                    <a
                      href="mailto:inkspire528@gmail.com"
                      className="text-primary hover:text-primary/80 font-medium inline-flex items-center gap-2"
                    >
                      inkspire528@gmail.com
                      <Send className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instagram */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center shrink-0">
                    <Instagram className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-semibold mb-2">Follow Us</h3>
                    <p className="text-muted-foreground mb-3">
                      Stay updated with our latest features and announcements
                    </p>
                    <a
                      href="https://instagram.com/inkspire.hq"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80 font-medium inline-flex items-center gap-2"
                    >
                      @inkspire.hq
                      <Instagram className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mission Statement Card */}
          <div className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MapPin className="w-6 h-6" />
              <h2 className="font-serif text-2xl font-bold">Our Mission</h2>
            </div>
            <p className="text-lg text-primary-foreground/90 mb-6 max-w-2xl mx-auto">
              Inkspire HQ is dedicated to empowering students worldwide through academic and creative expression. Founded by Abdullah Amir, we're building a global community of thinkers, writers, and innovators.
            </p>
            <p className="text-primary-foreground/90 mb-4">
              📍 Based in: <span className="font-semibold">Pakistan (Global Network)</span>
            </p>
            <div className="text-primary-foreground/80 italic">
              ✨ Inspiring Minds Through Ink & Ideas
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Quick Answers</h2>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How do I submit my work?</h3>
                <p className="text-sm text-muted-foreground">
                  Visit our <a href="/submit" className="text-primary hover:underline">Submit Work</a> page and choose the appropriate submission type. Fill out the form with your details and upload your work.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">How long does the review process take?</h3>
                <p className="text-sm text-muted-foreground">
                  Our review process typically takes 2-3 weeks. You'll receive an email notification once your submission has been reviewed.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Is there a fee to submit work?</h3>
                <p className="text-sm text-muted-foreground">
                  No! All submissions to Inkspire HQ are completely free. We believe in making academic and creative expression accessible to all students.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Can international students submit?</h3>
                <p className="text-sm text-muted-foreground">
                  Absolutely! Inkspire HQ welcomes submissions from students worldwide. We celebrate diverse perspectives and global voices.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
