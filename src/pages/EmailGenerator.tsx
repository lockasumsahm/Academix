import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Mail, Copy, Loader2, Sparkles, Lock } from "lucide-react";

interface Professor {
  id: string;
  full_name: string;
  department: string;
  research_areas: string[];
  lab_name: string | null;
  universities: { name: string };
}

const EmailGenerator = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [professor, setProfessor] = useState<Professor | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [emailDraft, setEmailDraft] = useState("");

  const [form, setForm] = useState({
    studentName: "",
    studentEmail: "",
    university: "",
    major: "",
    researchTopic: "",
    researchAbstract: "",
    whyThisProfessor: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        supabase.from("profiles").select("full_name, university, major").eq("id", user.id).single().then(({ data }) => {
          if (data) {
            setForm((prev) => ({
              ...prev,
              studentName: data.full_name || "",
              studentEmail: user.email || "",
              university: data.university || "",
              major: data.major || "",
            }));
          }
        });
      }
    });

    if (id) {
      supabase
        .from("professors")
        .select("id, full_name, department, research_areas, lab_name, contact_email, universities(name)")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          setProfessor(data as unknown as Professor);
          setLoading(false);
        });
    }
  }, [id]);

  const handleGenerate = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to generate emails.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    if (!form.researchTopic || !form.studentName) {
      toast({ title: "Missing fields", description: "Please fill in your name and research topic.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-email", {
        body: {
          professorName: professor?.full_name,
          professorDepartment: professor?.department,
          professorUniversity: professor?.universities?.name,
          professorResearchAreas: professor?.research_areas,
          professorLabName: professor?.lab_name,
          ...form,
        },
      });

      if (error) throw error;
      setEmailDraft(data.email);

      // Save to database
      if (professor) {
        await supabase.from("research_requests").insert({
          user_id: user.id,
          professor_id: professor.id,
          research_topic: form.researchTopic,
          research_summary: form.researchAbstract,
          email_draft: data.email,
          status: "draft",
        });
      }

      toast({ title: "Email generated!", description: "Your personalized email is ready." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message || "Failed to generate email.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(emailDraft);
    toast({ title: "Copied!", description: "Email copied to clipboard." });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  if (!professor) return <div className="min-h-screen flex items-center justify-center">Professor not found</div>;

  return (
    <div className="min-h-screen bg-secondary">
      <section className="bg-gradient-to-br from-hero-from to-hero-to text-primary-foreground py-10 sm:py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Link to={`/mentor/${professor.id}`} className="inline-flex items-center text-primary-foreground/70 hover:text-primary-foreground mb-4 text-sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Profile
          </Link>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
            <Mail className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            <span>Email Generator</span>
          </h1>
          <p className="text-sm sm:text-base text-primary-foreground/80">
            Generate a personalized research inquiry for <strong className="break-words">{professor.full_name}</strong>
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-10 space-y-6">
        {!user && (
          <Card className="border-accent">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Lock className="w-5 h-5 text-accent shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-sm">Sign in required</p>
                  <p className="text-xs text-muted-foreground">You need to sign in to generate emails.</p>
                </div>
              </div>
              <Link to="/auth" className="sm:ml-auto">
                <Button size="sm" className="w-full sm:w-auto">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Your Name *</Label>
                <Input value={form.studentName} onChange={(e) => setForm({ ...form, studentName: e.target.value })} placeholder="Your full name" />
              </div>
              <div>
                <Label>Your Email</Label>
                <Input value={form.studentEmail} onChange={(e) => setForm({ ...form, studentEmail: e.target.value })} placeholder="your@email.com" />
              </div>
              <div>
                <Label>Your University</Label>
                <Input value={form.university} onChange={(e) => setForm({ ...form, university: e.target.value })} placeholder="Your university" />
              </div>
              <div>
                <Label>Your Major / Field</Label>
                <Input value={form.major} onChange={(e) => setForm({ ...form, major: e.target.value })} placeholder="e.g., Computer Science" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Research Topic *</Label>
              <Input value={form.researchTopic} onChange={(e) => setForm({ ...form, researchTopic: e.target.value })} placeholder="e.g., AI for climate change prediction" />
            </div>
            <div>
              <Label>Research Abstract (150-300 words)</Label>
              <Textarea value={form.researchAbstract} onChange={(e) => setForm({ ...form, researchAbstract: e.target.value })} placeholder="Describe your research idea..." rows={5} />
            </div>
            <div>
              <Label>Why this professor?</Label>
              <Textarea value={form.whyThisProfessor} onChange={(e) => setForm({ ...form, whyThisProfessor: e.target.value })} placeholder="Why do you want to work with this professor specifically?" rows={3} />
            </div>

            <Button onClick={handleGenerate} disabled={generating || !user} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
              {generating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Email</>
              )}
            </Button>
          </CardContent>
        </Card>

        {emailDraft && (
          <Card className="border-primary">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Generated Email</CardTitle>
              <Button variant="outline" size="sm" onClick={copyEmail}>
                <Copy className="w-4 h-4 mr-1" /> Copy
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm font-sans bg-muted p-4 rounded-lg leading-relaxed">
                {emailDraft}
              </pre>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Copy this email and send it from your own email account. Personalize it further before sending.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EmailGenerator;
