import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, GraduationCap, MapPin, ExternalLink, BookOpen, Users } from "lucide-react";
import { useSeo } from "@/hooks/useSeo";

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  ranking: number | null;
}

interface Professor {
  id: string;
  full_name: string;
  department: string;
  research_areas: string[];
  lab_name: string | null;
  profile_link: string | null;
  scholar_link: string | null;
  accepting_students: boolean | null;
  universities: University;
}

const MentorFinder = () => {
  useSeo(
    "Find a Research Mentor | Academix Professor Directory",
    "Search a verified directory of professors by university and research field, then reach out with an AI-assisted, personalised email.",
  );

  const [professors, setProfessors] = useState<Professor[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const fields = [
    "Artificial Intelligence", "Machine Learning", "Deep Learning", "Computer Vision",
    "Natural Language Processing", "Robotics", "Data Science", "Cybersecurity",
    "Psychology", "Neuroscience", "Economics", "Biology", "Physics",
    "Environmental Science", "Mathematics",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [profResult, uniResult] = await Promise.all([
      supabase.from("professors").select("id, full_name, department, research_areas, lab_name, profile_link, scholar_link, accepting_students, universities(*)"),
      supabase.from("universities").select("*").order("ranking"),
    ]);
    if (profResult.data) setProfessors(profResult.data as unknown as Professor[]);
    if (uniResult.data) setUniversities(uniResult.data);
    setLoading(false);
  };

  const filtered = professors.filter((p) => {
    const matchesSearch = !searchQuery ||
      p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.research_areas.some((a) => a.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesUni = selectedUniversity === "all" || p.universities.id === selectedUniversity;
    const matchesField = selectedField === "all" ||
      p.research_areas.some((a) => a.toLowerCase().includes(selectedField.toLowerCase()));
    return matchesSearch && matchesUni && matchesField;
  });

  return (
    <div className="min-h-screen bg-secondary">
      {/* Hero */}
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 leading-tight">
            🔬 Research Mentor Finder
          </h1>
          <p className="text-base sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Find professors aligned with your research interests and connect with them professionally
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, field, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
              <SelectTrigger>
                <SelectValue placeholder="All Universities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Universities</SelectItem>
                {universities.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder="All Fields" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {fields.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>
      </section>

      {/* Results */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <p className="text-sm text-muted-foreground mb-6">
          {filtered.length} professor{filtered.length !== 1 ? "s" : ""} found
        </p>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Loading professors...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            No professors match your search. Try broadening your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((prof) => (
              <Link key={prof.id} to={`/mentor/${prof.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-serif text-lg font-semibold group-hover:text-primary transition-colors">
                          {prof.full_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{prof.department}</p>
                      </div>
                      {prof.accepting_students && (
                        <Badge className="bg-accent/20 text-accent-foreground text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Open
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <GraduationCap className="w-4 h-4" />
                      <span>{prof.universities.name}</span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                      <MapPin className="w-3 h-3" />
                      <span>{prof.universities.city}, {prof.universities.country}</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {prof.research_areas.slice(0, 3).map((area) => (
                        <Badge key={area} variant="secondary" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {prof.research_areas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{prof.research_areas.length - 3}
                        </Badge>
                      )}
                    </div>

                    {prof.lab_name && (
                      <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {prof.lab_name}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default MentorFinder;
