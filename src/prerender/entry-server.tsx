/**
 * Server entry used only at build time (scripts/prerender.ts) to render the
 * public marketing pages to static HTML so crawlers get real content without
 * executing JavaScript. The browser then hydrates the same routes normally.
 */
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { Routes, Route, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Programs from "@/pages/Programs";
import Submit from "@/pages/Submit";
import Features from "@/pages/Features";
import JoinUs from "@/pages/JoinUs";
import Contact from "@/pages/Contact";
import Faq from "@/pages/Faq";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";

const MarketingLayout = () => (
  <div className="flex min-h-screen flex-col">
    <Navigation />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

export function render(url: string): string {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: Infinity } },
  });

  return renderToString(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <StaticRouter location={url}>
          <AuthProvider>
            <Routes>
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
              </Route>
            </Routes>
          </AuthProvider>
        </StaticRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  );
}
