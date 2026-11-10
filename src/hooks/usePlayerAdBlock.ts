import { useEffect, useState } from "react";

/**
 * Protects the player from popups, popunders, ad redirects, and focus hijacking
 * without using `<iframe sandbox>`, which many video providers explicitly block.
 */
export function usePlayerAdBlock(active: boolean = true) {
  const [blockedCount, setBlockedCount] = useState(0);

  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const originalOpen = window.open;

    // 1. Neutralize window.open popups while player is active
    window.open = function (..._args: Parameters<typeof window.open>) {
      setBlockedCount((c) => c + 1);
      return null;
    };

    // 2. Prevent popunder / focus-stealing redirects
    const handleBlur = () => {
      // If focus leaves the window right after a click, reclaim focus
      setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") {
          return;
        }
        try {
          window.focus();
        } catch {
          // ignore
        }
      }, 50);
    };

    // 3. Block unwanted top-level navigation hijacking
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only prevent if something outside user intent tries to redirect
      if (document.activeElement?.tagName === "IFRAME") {
        e.preventDefault();
        e.returnValue = "";
        setBlockedCount((c) => c + 1);
      }
    };

    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.open = originalOpen;
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [active]);

  return { blockedCount };
}
