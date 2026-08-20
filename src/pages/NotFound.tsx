import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Compass, Home as HomeIcon, Search } from "lucide-react";

const SUGGESTIONS = [
  { to: "/", label: "Home" },
  { to: "/community", label: "Community feed" },
  { to: "/researchers", label: "Researchers" },
  { to: "/publications", label: "Publications" },
  { to: "/mentors", label: "Find a mentor" },
  { to: "/faq", label: "FAQs" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Page not found | Academix";
  }, [location.pathname]);

  return (
    <main className="flex min-h-[70dvh] items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Compass className="h-7 w-7 text-muted-foreground" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">We couldn't find that page</h1>
        <p className="mt-3 text-muted-foreground">
          The link may be broken or the page may have moved. Here's where you can go next.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/">
              <HomeIcon className="h-4 w-4" aria-hidden="true" />
              <span>Back to home</span>
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/researchers">
              <Search className="h-4 w-4" aria-hidden="true" />
              <span>Browse researchers</span>
            </Link>
          </Button>
        </div>

        <nav aria-label="Helpful links" className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {s.label}
            </Link>
          ))}
        </nav>
      </div>
    </main>
  );
};

export default NotFound;
