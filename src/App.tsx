import { lazy, Suspense } from "react";
import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { AppShell } from "@/components/AppShell";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { NotificationsProvider } from "@/hooks/useNotifications";
import Home from "./pages/Home";
import { RoutePrefetcher } from "@/components/RoutePrefetcher";
import { routeLoaders } from "@/lib/routePreload";

// Lazy-load non-critical routes to reduce initial JS bundle
const SiteTextEditor = lazy(() => import("@/components/admin/SiteTextEditor").then((m) => ({ default: m.SiteTextEditor })));
const About = lazy(() => routeLoaders["/about"]() as Promise<{ default: React.ComponentType }>);
const Programs = lazy(() => routeLoaders["/programs"]() as Promise<{ default: React.ComponentType }>);
const Submit = lazy(() => routeLoaders["/submit"]() as Promise<{ default: React.ComponentType }>);
const Features = lazy(() => routeLoaders["/features"]() as Promise<{ default: React.ComponentType }>);
const JoinUs = lazy(() => routeLoaders["/join"]() as Promise<{ default: React.ComponentType }>);
const Contact = lazy(() => routeLoaders["/contact"]() as Promise<{ default: React.ComponentType }>);
const MentorFinder = lazy(() => routeLoaders["/mentors"]() as Promise<{ default: React.ComponentType }>);
const ProfessorProfile = lazy(() => import("./pages/ProfessorProfile"));
const EmailGenerator = lazy(() => import("./pages/EmailGenerator"));
const Auth = lazy(() => routeLoaders["/auth"]() as Promise<{ default: React.ComponentType }>);
const Community = lazy(() => routeLoaders["/community"]() as Promise<{ default: React.ComponentType }>);
const Messages = lazy(() => routeLoaders["/messages"]() as Promise<{ default: React.ComponentType }>);
const AcademixAI = lazy(() => routeLoaders["/ai"]() as Promise<{ default: React.ComponentType }>);
const Profile = lazy(() => routeLoaders["/profile"]() as Promise<{ default: React.ComponentType }>);
const ResearcherProfile = lazy(() => import("./pages/ResearcherProfile"));
const Researchers = lazy(() => routeLoaders["/researchers"]() as Promise<{ default: React.ComponentType }>);
const Publications = lazy(() => routeLoaders["/publications"]() as Promise<{ default: React.ComponentType }>);
const Notifications = lazy(() => routeLoaders["/notifications"]() as Promise<{ default: React.ComponentType }>);
const Settings = lazy(() => routeLoaders["/settings"]() as Promise<{ default: React.ComponentType }>);
const Opportunities = lazy(() => routeLoaders["/opportunities"]() as Promise<{ default: React.ComponentType }>);
const Privacy = lazy(() => routeLoaders["/privacy"]() as Promise<{ default: React.ComponentType }>);
const Terms = lazy(() => routeLoaders["/terms"]() as Promise<{ default: React.ComponentType }>);
const Faq = lazy(() => routeLoaders["/faq"]() as Promise<{ default: React.ComponentType }>);
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const MarketingLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navigation />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <NotificationsProvider>
            <ScrollToTop />
            <RoutePrefetcher />
            <Suspense fallback={null}>
              <SiteTextEditor />
            </Suspense>
            <Suspense fallback={<div className="min-h-screen" />}>
              <Routes>
                {/* Friendly aliases for commonly guessed URLs */}
                <Route path="/academix-ai" element={<Navigate to="/ai" replace />} />
                <Route path="/assistant" element={<Navigate to="/ai" replace />} />
                <Route path="/feed" element={<Navigate to="/community" replace />} />
                <Route path="/login" element={<Navigate to="/auth" replace />} />
                <Route path="/signup" element={<Navigate to="/auth" replace />} />
                <Route path="/register" element={<Navigate to="/auth" replace />} />
                <Route path="/mentor-finder" element={<Navigate to="/mentors" replace />} />
                <Route path="/professors" element={<Navigate to="/mentors" replace />} />

                {/* Public marketing site */}
                <Route element={<MarketingLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/programs" element={<Programs />} />
                  <Route path="/submit" element={<Submit />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/join" element={<JoinUs />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="*" element={<NotFound />} />
                </Route>

                {/* Application shell */}
                <Route element={<AppShell />}>
                  <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                  <Route path="/researchers" element={<ProtectedRoute><Researchers /></ProtectedRoute>} />
                  <Route path="/publications" element={<ProtectedRoute><Publications /></ProtectedRoute>} />
                  <Route path="/opportunities" element={<Opportunities />} />
                  <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                  <Route path="/ai" element={<ProtectedRoute><AcademixAI /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/researcher/:id" element={<ResearcherProfile />} />
                  <Route path="/mentors" element={<MentorFinder />} />
                  <Route path="/mentor/:id" element={<ProfessorProfile />} />
                  <Route path="/mentor/:id/email" element={<ProtectedRoute><EmailGenerator /></ProtectedRoute>} />
                </Route>
              </Routes>
            </Suspense>
          </NotificationsProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
