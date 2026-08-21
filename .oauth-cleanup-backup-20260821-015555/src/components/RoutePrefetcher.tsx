import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { preloadLikelyRoutes, preloadRoute } from "@/lib/routePreload";

/**
 * Warms up route chunks so navigation feels instant:
 *  - hover / touch / focus on any internal link preloads its chunk
 *  - after idle, the most likely destinations for the current area preload
 */
export const RoutePrefetcher = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const handler = (event: Event) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/") || anchor.target === "_blank") return;
      preloadRoute(href.split("?")[0].split("#")[0]);
    };

    const opts = { capture: true, passive: true } as AddEventListenerOptions;
    document.addEventListener("pointerover", handler, opts);
    document.addEventListener("pointerdown", handler, opts);
    document.addEventListener("focusin", handler, opts);
    return () => {
      document.removeEventListener("pointerover", handler, opts);
      document.removeEventListener("pointerdown", handler, opts);
      document.removeEventListener("focusin", handler, opts);
    };
  }, []);

  useEffect(() => {
    const inApp = /^\/(community|researchers|publications|messages|ai|notifications|settings|profile|mentors|researcher|mentor|opportunities)/.test(
      pathname,
    );
    preloadLikelyRoutes(
      inApp
        ? ["/community", "/researchers", "/publications", "/messages", "/profile", "/ai"]
        : ["/auth", "/about", "/features", "/mentors", "/community"],
    );
  }, [pathname]);

  return null;
};
