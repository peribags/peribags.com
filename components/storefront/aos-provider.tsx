"use client";

import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

/**
 * Initialises AOS once on the client. Mounted inside the storefront layout so
 * every page picks it up automatically. Refreshes on route change via a
 * MutationObserver fallback (Next App Router doesn't fire a global event).
 */
export function AOSProvider() {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 60,
      mirror: false,
      anchorPlacement: "top-bottom",
      disable: () =>
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    });

    // Re-evaluate offsets after images/fonts settle.
    const onLoad = () => AOS.refresh();
    window.addEventListener("load", onLoad);
    const t = window.setTimeout(() => AOS.refresh(), 600);

    return () => {
      window.removeEventListener("load", onLoad);
      window.clearTimeout(t);
    };
  }, []);

  return null;
}
