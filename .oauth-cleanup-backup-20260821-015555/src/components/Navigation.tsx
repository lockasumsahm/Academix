import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Avatar } from "@/components/network/Avatar";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Feed", path: "/community" },
  { name: "Researchers", path: "/researchers" },
  { name: "Professors", path: "/mentors" },
  { name: "Publications", path: "/publications" },
  { name: "Academix AI", path: "/ai" },
  { name: "About", path: "/about" },
];



export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const profile = useMyProfile();
  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Account";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "A";


  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-50 w-full flex justify-center px-3 pt-3">
      <nav
        className={cn(
          "w-full max-w-6xl rounded-2xl transition-all duration-300",
          scrolled
            ? "bg-card/80 backdrop-blur-xl border border-border shadow-elevated"
            : "bg-card/50 backdrop-blur-md border border-primary-foreground/60"
        )}
      >
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-14">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-bold">A</span>
              </div>
              <span className="text-[15px] font-semibold text-primary tracking-tight">
                Academix
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary/60"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {user ? (
                <>
                  <Link to="/community">
                    <Button size="sm" className="text-sm font-medium rounded-lg h-9 px-4">
                      Open Academix
                    </Button>
                  </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2 rounded-lg">
                      <Avatar initials={initials} src={profile?.avatar_url} size="xs" />
                      <span className="max-w-[140px] truncate text-sm font-medium">{displayName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-popover">
                    <DropdownMenuLabel className="truncate">
                      <span className="block truncate">{displayName}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <UserIcon className="w-4 h-4 mr-2" /> My profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                      <LogOut className="w-4 h-4 mr-2" /> Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button variant="ghost" size="sm" className="text-sm font-medium">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/auth">
                    <Button size="sm" className="text-sm font-medium rounded-lg h-9 px-4">
                      Get started
                    </Button>
                  </Link>
                </>
              )}
            </div>


            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-1">
              {user && (
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mb-2 flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2"
                >
                  <Avatar initials={initials} src={profile?.avatar_url} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{displayName}</span>
                    <span className="block truncate text-xs text-muted-foreground">View profile</span>
                  </span>
                </Link>
              )}
              {navItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary"
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-2 flex gap-2">
                {user ? (
                  <>
                    <Link to="/community" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">Open Academix</Button>
                    </Link>
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => { setMobileMenuOpen(false); signOut(); navigate("/"); }}>
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">Sign in</Button>
                    </Link>
                    <Link to="/auth" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                      <Button size="sm" className="w-full">Get started</Button>
                    </Link>
                  </>
                )}
              </div>

            </div>
          )}
        </div>
      </nav>
    </div>
  );
};
