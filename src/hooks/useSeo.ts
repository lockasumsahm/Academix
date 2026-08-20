import { useEffect } from "react";

const SITE_URL = "https://academix.inkspirehq.live";

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * Sets the per-route title, description, canonical URL and social tags.
 * Crawlers that execute JS (Googlebot) read these; the static tags in
 * index.html remain the fallback for non-JS social preview crawlers.
 */
export const useSeo = (title: string, description: string, options?: { noindex?: boolean }) => {
  const noindex = options?.noindex ?? false;

  useEffect(() => {
    document.title = title;

    upsertMeta('meta[name="description"]', "name", "description", description);
    upsertMeta('meta[property="og:title"]', "property", "og:title", title);
    upsertMeta('meta[property="og:description"]', "property", "og:description", description);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

    const url = `${SITE_URL}${window.location.pathname}`;
    upsertMeta('meta[property="og:url"]', "property", "og:url", url);
    upsertCanonical(url);

    upsertMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );
  }, [title, description, noindex]);
};
