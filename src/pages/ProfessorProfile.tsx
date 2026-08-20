import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSeo } from "@/hooks/useSeo";
import { useAuth } from "@/hooks/useAuth";
import { PROFESSOR_PUBLIC_COLUMNS } from "@/lib/dbColumns";
import { GraduationCap, MapPin, ExternalLink, BookOpen, ArrowLeft, Mail, Users, Globe } from "lucide-react";

interface Professor {
  id: string;
  full_name: string;
  department: string;
  research_areas: string[];
  lab_name: string | null;
  profile_link: string | null;
  scholar_link: string | null;
  researchgate_link: string | null;
  contact_email: string | null;
  accepting_students: boolean | null;
  universities: {
    id: string;
    name: string;
    country: string;
    city: string;
    website: string | null;
    ranking: number | null;
  };
}

const ProfessorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Contact emails are only readable by signed-in users.
    const columns = `${PROFESSOR_PUBLIC_COLUMNS}${user ? ", contact_email" : ""}, universities(*)`;
    supabase
      .from("professors")
      .select(columns)
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setProfessor(data as unknown as Professor);
        setLoading(false);
      });
  }, [id, user]);

  useSeo(
    professor ? `${professor.full_name} — ${professor.universities?.name ?? "Research Mentor"} | Academix` : "Research Mentor | Academix",
    professor
      ? `${professor.full_name}, ${professor.department}${professor.universities?.name ? ` at ${professor.universities.name}` : ""}. Research areas: ${(professor.research_areas ?? []).slice(0, 5).join(", ")}. Contact this mentor through Academix.`
      : "Explore verified research mentors and professors on Academix.",
  );




  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!professor) return <div className="min-h-screen flex items-center justify-center">Professor not found</div>;

  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/mentors" className="inline-flex items-center text-primary-foreground/70 hover:text-primary-foreground mb-4 sm:mb-6 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Search
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold mb-2 break-words">{professor.full_name}</h1>
              <p className="text-base sm:text-lg text-primary-foreground/80">{professor.department}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-sm text-primary-foreground/70">
                <span className="inline-flex items-center gap-1"><GraduationCap className="w-4 h-4" />{professor.universities.name}</span>
                <span className="hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" />{professor.universities.city}, {professor.universities.country}</span>
              </div>
            </div>
            {professor.accepting_students && (
              <Badge className="bg-accent/20 text-accent-foreground border-accent/30 self-start shrink-0">
                <Users className="w-3 h-3 mr-1" /> Accepting Students
              </Badge>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Research Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {professor.research_areas.map((area) => (
                  <Badge key={area} variant="secondary" className="text-sm py-1 px-3">{area}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {professor.lab_name && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lab / Research Group</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  <span className="font-medium">{professor.lab_name}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-6 text-center">
              <h3 className="font-serif text-xl font-semibold mb-2">
                Interested in working with {professor.full_name.split(" ")[0]}?
              </h3>
              <p className="text-primary-foreground/80 mb-4 text-sm">
                Generate a personalized research inquiry email using AI
              </p>
              <Link to={`/mentor/${professor.id}/email`}>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Mail className="w-4 h-4 mr-2" /> Generate Email
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {professor.profile_link && (
                <a href={professor.profile_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Globe className="w-4 h-4" /> University Profile
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {professor.scholar_link && (
                <a href={professor.scholar_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <BookOpen className="w-4 h-4" /> Google Scholar
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {professor.researchgate_link && (
                <a href={professor.researchgate_link} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <BookOpen className="w-4 h-4" /> ResearchGate
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              {professor.contact_email && (
                <a href={`mailto:${professor.contact_email}`}
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <Mail className="w-4 h-4" /> {professor.contact_email}
                </a>
              )}
              {professor.universities.website && (
                <a href={professor.universities.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <GraduationCap className="w-4 h-4" /> {professor.universities.name}
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </CardContent>
          </Card>

          {professor.universities.ranking && (
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">University Ranking</p>
                <p className="text-2xl font-bold text-primary">#{professor.universities.ranking}</p>
                <p className="text-xs text-muted-foreground">Global</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfessorProfile;
