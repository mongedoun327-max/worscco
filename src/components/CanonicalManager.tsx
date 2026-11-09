import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Dynamically synchronizes <link rel="canonical"> and <meta property="og:url">
 * on every client-side page transition, guaranteeing zero canonical conflict errors
 * for crawlers, validators, and Google Search Console.
 */
export const CanonicalManager = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const origin = window.location.origin;
    const pathname = location.pathname;
    const canonicalUrl = `${origin}${pathname === "/" ? "/" : pathname}`;

    // 1. Update or create canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "canonical");
      document.head.appendChild(link);
    }
    link.setAttribute("href", canonicalUrl);

    // 2. Update or create og:url meta
    let ogUrl = document.querySelector('meta[property="og:url"]') as HTMLMetaElement | null;
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", canonicalUrl);
  }, [location.pathname]);

  return null;
};

export default CanonicalManager;
