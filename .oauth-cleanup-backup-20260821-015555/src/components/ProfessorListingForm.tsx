import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Save, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface University {
  id: string;
  name: string;
  country: string;
  city: string;
}

const emptyNew = { name: "", country: "", city: "", website: "" };

/**
 * Lets a professor account create and maintain its own entry in the public
 * mentor directory. Everything here is entered by the professor themselves.
 */
export const ProfessorListingForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [universityId, setUniversityId] = useState("");
  const [addingUniversity, setAddingUniversity] = useState(false);
  const [newUniversity, setNewUniversity] = useState(emptyNew);

  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [researchAreas, setResearchAreas] = useState("");
  const [labName, setLabName] = useState("");
  const [profileLink, setProfileLink] = useState("");
  const [scholarLink, setScholarLink] = useState("");
  const [researchgateLink, setResearchgateLink] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [accepting, setAccepting] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const [{ data: unis }, { data: mine }, { data: profile }] = await Promise.all([
        supabase.from("universities").select("id, name, country, city").order("name"),
        supabase.from("professors").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      ]);
      if (!active) return;
      setUniversities((unis as University[]) ?? []);
      if (mine) {
        setListingId(mine.id);
        setFullName(mine.full_name ?? "");
        setUniversityId(mine.university_id ?? "");
        setDepartment(mine.department ?? "");
        setResearchAreas((mine.research_areas ?? []).join(", "));
        setLabName(mine.lab_name ?? "");
        setProfileLink(mine.profile_link ?? "");
        setScholarLink(mine.scholar_link ?? "");
        setResearchgateLink(mine.researchgate_link ?? "");
        setContactEmail(mine.contact_email ?? "");
        setAccepting(mine.accepting_students ?? true);
      } else {
        setFullName(profile?.full_name ?? "");
        setContactEmail(user.email ?? "");
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (!fullName.trim() || !department.trim()) {
      toast.error("Name and department are required");
      return;
    }
    setSaving(true);

    let uniId = universityId;
    if (addingUniversity) {
      if (!newUniversity.name.trim() || !newUniversity.country.trim() || !newUniversity.city.trim()) {
        setSaving(false);
        toast.error("Fill in the university name, city and country");
        return;
      }
      const { data, error } = await supabase
        .from("universities")
        .insert({
          name: newUniversity.name.trim(),
          country: newUniversity.country.trim(),
          city: newUniversity.city.trim(),
          website: newUniversity.website.trim() || null,
        })
        .select("id, name, country, city")
        .single();
      if (error || !data) {
        setSaving(false);
        toast.error(error?.message ?? "Could not add that university");
        return;
      }
      uniId = data.id;
      setUniversities((prev) => [...prev, data as University].sort((a, b) => a.name.localeCompare(b.name)));
      setUniversityId(data.id);
      setAddingUniversity(false);
      setNewUniversity(emptyNew);
    }

    if (!uniId) {
      setSaving(false);
      toast.error("Choose your university");
      return;
    }

    const payload = {
      user_id: user.id,
      full_name: fullName.trim(),
      university_id: uniId,
      department: department.trim(),
      research_areas: researchAreas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      lab_name: labName.trim() || null,
      profile_link: profileLink.trim() || null,
      scholar_link: scholarLink.trim() || null,
      researchgate_link: researchgateLink.trim() || null,
      contact_email: contactEmail.trim() || null,
      accepting_students: accepting,
    };

    const { data, error } = listingId
      ? await supabase.from("professors").update(payload).eq("id", listingId).select("id").single()
      : await supabase.from("professors").insert(payload).select("id").single();

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setListingId(data.id);
    toast.success(listingId ? "Listing updated" : "You are now in the mentor directory");
  };

  if (loading) {
    return (
      <div className="surface flex justify-center p-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="surface space-y-4 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-primary">Mentor directory listing</h2>
        {listingId && (
          <Link
            to={`/mentor/${listingId}`}
            className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
          >
            View public listing <ExternalLink className="h-3 w-3" />
          </Link>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        This is what students see when they search for mentors. Only you can edit it.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Full name *</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={120} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Department *</Label>
          <Input
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science"
            maxLength={120}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">University *</Label>
        {addingUniversity ? (
          <div className="space-y-2 rounded-lg border border-border p-3">
            <Input
              value={newUniversity.name}
              onChange={(e) => setNewUniversity({ ...newUniversity, name: e.target.value })}
              placeholder="University name"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <Input
                value={newUniversity.city}
                onChange={(e) => setNewUniversity({ ...newUniversity, city: e.target.value })}
                placeholder="City"
              />
              <Input
                value={newUniversity.country}
                onChange={(e) => setNewUniversity({ ...newUniversity, country: e.target.value })}
                placeholder="Country"
              />
            </div>
            <Input
              value={newUniversity.website}
              onChange={(e) => setNewUniversity({ ...newUniversity, website: e.target.value })}
              placeholder="Website (optional)"
            />
            <button
              type="button"
              className="text-xs text-muted-foreground underline"
              onClick={() => setAddingUniversity(false)}
            >
              Pick from the list instead
            </button>
          </div>
        ) : (
          <>
            <select
              value={universityId}
              onChange={(e) => setUniversityId(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select your university</option>
              {universities.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.city}, {u.country}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="text-xs text-accent underline"
              onClick={() => setAddingUniversity(true)}
            >
              My university is not listed
            </button>
          </>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Research areas</Label>
        <Textarea
          value={researchAreas}
          onChange={(e) => setResearchAreas(e.target.value)}
          placeholder="Machine learning, Computer vision, Robotics"
          rows={2}
        />
        <p className="text-[11px] text-muted-foreground">Separate each area with a comma.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Lab or research group</Label>
          <Input value={labName} onChange={(e) => setLabName(e.target.value)} maxLength={160} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Contact email</Label>
          <Input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">University profile link</Label>
          <Input value={profileLink} onChange={(e) => setProfileLink(e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Google Scholar</Label>
          <Input value={scholarLink} onChange={(e) => setScholarLink(e.target.value)} placeholder="https://" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">ResearchGate</Label>
          <Input value={researchgateLink} onChange={(e) => setResearchgateLink(e.target.value)} placeholder="https://" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-primary">Accepting students</p>
          <p className="text-xs text-muted-foreground">Shows an "Accepting students" badge on your listing.</p>
        </div>
        <Switch checked={accepting} onCheckedChange={setAccepting} />
      </div>

      <Button className="rounded-lg gap-1.5" onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
        {listingId ? "Update listing" : "Publish listing"}
      </Button>
    </section>
  );
};
