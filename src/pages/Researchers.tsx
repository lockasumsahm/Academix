import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Loader2, Search, Users } from "lucide-react";
import { Avatar } from "@/components/network/Avatar";
import { EmptyState } from "@/components/network/EmptyState";
import { PageHeader } from "@/components/network/PageHeader";
import { FollowButton } from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useSeo } from "@/hooks/useSeo";
import { initialsOf } from "@/lib/format";

interface Row {
  id: string;
  full_name: string | null;
  headline: string | null;
  university: string | null;
  country: string | null;
  major: string | null;
  avatar_url: string | null;
  research_interests: string[] | null;
  open_to_collaboration: boolean | null;
}

const Researchers = () => {
  const [params, setParams] = useSearchParams();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const q = params.get("q") ?? "";

  useSeo(
    "Researchers | Academix",
    "Browse student researchers and academics on Academix by university, field and research interests.",
    { noindex: true },
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    supabase
      .from("profiles")
      .select("id, full_name, headline, university, country, major, avatar_url, research_interests, open_to_collaboration")
      .order("updated_at", { ascending: false })
      .limit(120)
      .then(({ data }) => {
        if (!active) return;
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((r) =>
      [r.full_name, r.headline, r.university, r.major, ...(r.research_interests ?? [])]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    );
  }, [rows, q]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <PageHeader
        eyebrow="Directory"
        title="Researchers"
        subtitle="Find peers, co-authors and collaborators across universities and fields."
      />

      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})}
          placeholder="Search by name, university, field or interest"
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No researchers match that search"
          description="Try a broader term — a field, university or country — or browse the professor directory instead."
          action={<Link to="/mentors"><Button size="sm" className="rounded-lg">Browse professors</Button></Link>}
        />
      ) : (
        <div className="grid items-stretch gap-3 sm:grid-cols-2">
          {filtered.map((r) => (
            <article key={r.id} className="surface card-lift flex h-full flex-col p-4">
              <div className="flex items-start gap-3">
                <Avatar initials={initialsOf(r.full_name ?? "A")} src={r.avatar_url} size="md" />
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/researcher/${r.id}`}
                    className="block truncate text-sm font-semibold text-primary hover:text-accent"
                  >
                    {r.full_name ?? "Researcher"}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.headline ?? r.major ?? "Researcher"}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                    {[r.university, r.country].filter(Boolean).join(" • ")}
                  </p>
                </div>
                <FollowButton targetId={r.id} />
              </div>
              {(r.research_interests?.length ?? 0) > 0 && (
                <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                  {r.research_interests!.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Researchers;
