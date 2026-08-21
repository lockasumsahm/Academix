import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutGrid, Users, GraduationCap, BookOpen, MessageSquare, Sparkles, Compass,
  Bell, Settings as SettingsIcon, User as UserIcon, LogOut, Menu, X, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useMyProfile } from "@/hooks/useMyProfile";
import { Avatar } from "@/components/network/Avatar";
import { initialsOf } from "@/lib/format";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

const items = [
  { name: "Feed", path: "/community", icon: LayoutGrid },
  { name: "Researchers", path: "/researchers", icon: Users },
  { name: "Professors", path: "/mentors", icon: GraduationCap },
  { name: "Publications", path: "/publications", icon: BookOpen },
  { name: "Opportunities", path: "/opportunities", icon: Compass },
  { name: "Messages", path: "/messages", icon: MessageSquare },
  { name: "Academix AI", path: "/ai", icon: Sparkles },
  { name: "Notifications", path: "/notifications", icon: Bell },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-sidebar-active text-primary-foreground"
      : "text-sidebar-foreground hover:bg-sidebar-active/60 hover:text-primary-foreground",
  );

export const AppShell = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { unread } = useNotifications();
  const profile = useMyProfile();
  const displayName = profile?.full_name?.trim() || user?.email?.split("@")[0] || "Account";

  const nav = (
    <nav className="flex-1 space-y-1">
      {items.map((item) => (
        <NavLink key={item.path} to={item.path} className={linkClass} onClick={() => setOpen(false)}>
          <item.icon className="h-[18px] w-[18px] opacity-80" />
          <span className="flex-1">{item.name}</span>
          {item.path === "/notifications" && unread > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-accent-foreground">
              {unread}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar p-5 lg:flex">
        <Link to="/" className="mb-8 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-primary-foreground serif">
            A
          </span>
          <span className="serif text-xl font-semibold tracking-tight text-primary-foreground">Academix</span>
        </Link>
        {nav}
        <div className="mt-auto space-y-1 border-t border-sidebar-border pt-4">
          <NavLink to="/profile" className={linkClass}>
            <UserIcon className="h-[18px] w-[18px] opacity-80" /> Profile
          </NavLink>
          <NavLink to="/settings" className={linkClass}>
            <SettingsIcon className="h-[18px] w-[18px] opacity-80" /> Settings
          </NavLink>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/85 px-4 backdrop-blur-xl sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <form
            className="relative hidden max-w-sm flex-1 sm:block"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new FormData(e.currentTarget).get("q") as string;
              navigate(`/researchers?q=${encodeURIComponent(q ?? "")}`);
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              placeholder="Search researchers or publications..."
              className="w-full rounded-md border border-border bg-secondary/60 py-1.5 pl-9 pr-3 text-xs outline-none transition focus:border-accent focus:bg-card"
            />
          </form>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/notifications" className="relative">
              <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Notifications">
                <Bell className="h-[18px] w-[18px]" />
              </Button>
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />
              )}
            </Link>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 rounded-lg">
                    <Avatar initials={initialsOf(displayName)} src={profile?.avatar_url} size="xs" />
                    <span className="hidden max-w-[140px] truncate text-xs font-medium sm:block">{displayName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover">
                  <DropdownMenuLabel className="space-y-0.5">
                    <p className="truncate text-sm font-semibold text-primary">{displayName}</p>
                    <p className="truncate text-[11px] font-normal text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserIcon className="mr-2 h-4 w-4" /> My profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await signOut(); navigate("/"); }}>
                    <LogOut className="mr-2 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button size="sm" className="rounded-lg">Sign in</Button>
              </Link>
            )}
          </div>
        </header>

        {/* Mobile nav drawer */}
        {open && (
          <div className="border-b border-sidebar-border bg-sidebar p-4 lg:hidden">
            {nav}
            <div className="mt-2 space-y-1 border-t border-sidebar-border pt-3">
              <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
                <UserIcon className="h-[18px] w-[18px]" /> Profile
              </NavLink>
              <NavLink to="/settings" className={linkClass} onClick={() => setOpen(false)}>
                <SettingsIcon className="h-[18px] w-[18px]" /> Settings
              </NavLink>
            </div>
          </div>
        )}

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
