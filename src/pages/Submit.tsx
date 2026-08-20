import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Send, ExternalLink } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const Submit = () => {
  useSeo(
    "Submit Your Research | Academix",
    "Share your research paper, project or preprint with the Academix community and get discovered by professors and universities.",
  );

  const handleSubmit = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScBYUsofkgif058BBxEh9qYG0WYlrO9oBIFstUIwRXNcSIUZA/viewform?usp=header", "_blank");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">Submit Your Work</h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Share your work, inspire others, and get recognized by Inkspire HQ
          </p>
        </div>
      </section>

      {/* Submit CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Send className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-serif text-3xl font-bold mb-4">Ready to Share Your Work?</h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
                Submit your research papers, poetry, creative writing, or articles. Selected works receive official recognition and certificates from Inkspire HQ.
              </p>
              <Button onClick={handleSubmit} size="lg" className="text-lg px-8">
                Submit Your Work
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Follow <a href="https://instagram.com/inkspire.hq" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">@inkspire.hq</a> for updates and featured posts!
              </p>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <FileText className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Accepted Formats</h3>
                <p className="text-sm text-muted-foreground">
                  PDF, DOCX, or accessible cloud links
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">📜</div>
                <h3 className="font-semibold mb-2">Certificate</h3>
                <p className="text-sm text-muted-foreground">
                  Selected works receive official recognition
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">💼</div>
                <h3 className="font-semibold mb-2">CV Growth</h3>
                <p className="text-sm text-muted-foreground">
                  Published works strengthen your profile
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Submit;
