import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Search, Share2, Globe, CheckCircle, ExternalLink } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

const roles = [
  {
    icon: Search,
    title: "Research Reviewer",
    description: "Help evaluate and provide feedback on submitted research papers",
    requirements: [
      "Academic background in relevant field",
      "Strong analytical and critical thinking skills",
      "Commitment to objective evaluation"
    ]
  },
  {
    icon: Share2,
    title: "Social Media Coordinator",
    description: "Manage our social media presence and engage with our community",
    requirements: [
      "Experience with social media platforms",
      "Creative content creation skills",
      "Passionate about student empowerment"
    ]
  },
  {
    icon: Globe,
    title: "Student Ambassador",
    description: "Represent Inkspire HQ at your university and recruit contributors",
    requirements: [
      "Strong communication skills",
      "Active in university community",
      "Enthusiasm for academic writing"
    ]
  }
];

const JoinUs = () => {
  useSeo(
    "Join Academix | Become a Student Researcher",
    "Create a free Academix profile, publish research, message professors and get discovered by universities and labs worldwide.",
  );

  const handleApply = () => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLSdwT0PN_fK1qa0SZdw5OY8oorPgvZGZ_plQLEDzILDow2u1cA/viewform?usp=dialog", "_blank");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-12 h-12" />
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">Join Our Team</h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Become part of the Inkspire HQ global network of creative thinkers and change-makers
          </p>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Why Join Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Build Your Network</h3>
              <p className="text-sm text-muted-foreground">
                Connect with students, writers, and academics from around the world
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Gain Experience</h3>
              <p className="text-sm text-muted-foreground">
                Develop valuable skills in leadership, communication, and organization
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-2">Make an Impact</h3>
              <p className="text-sm text-muted-foreground">
                Help empower students globally to share their work and ideas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Roles */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Available Roles</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <role.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-xl">{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold text-sm mb-3">Requirements:</h4>
                  <ul className="space-y-2">
                    {role.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Apply CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="text-center">
            <CardContent className="pt-12 pb-12">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-accent" />
              </div>
              <h2 className="font-serif text-3xl font-bold mb-4">Ready to Join?</h2>
              <p className="text-muted-foreground mb-8 text-lg max-w-xl mx-auto">
                Fill out our application form and become part of our mission to inspire minds through ink and ideas.
              </p>
              <Button onClick={handleApply} size="lg" className="text-lg px-8">
                Submit Application
                <ExternalLink className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Follow <a href="https://instagram.com/inkspire.hq" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline font-semibold">@inkspire.hq</a> for updates!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">What Our Team Says</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "Being part of Inkspire HQ has been incredibly rewarding. I've connected with amazing students worldwide and helped bring their research to light."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="font-serif font-bold text-primary">JD</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Jessica Davis</p>
                    <p className="text-xs text-muted-foreground">Research Reviewer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground italic mb-4">
                  "As a Student Ambassador, I've been able to help my peers get published. It's amazing to see their work recognized!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <span className="font-serif font-bold text-accent">MK</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Michael Kim</p>
                    <p className="text-xs text-muted-foreground">Student Ambassador</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default JoinUs;
