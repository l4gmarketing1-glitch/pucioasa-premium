"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function isConfirmationPage(pathname: string) {
  return ["/comanda/succes", "/felicitari"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export default function GoogleTagManager() {
  const pathname = usePathname();

  useEffect(() => {
    const existing = document.getElementById("google-tag-manager");
    if (isConfirmationPage(pathname)) {
      // A loaded container cannot be unloaded by removing its script element.
      // Confirmation links use document navigation; this also guards SPA links.
      if (existing) window.location.reload();
      return;
    }
    if (existing) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    // GTM needs its startup event as well as the gtag helper supplied by the owner.
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

    const script = document.createElement("script");
    script.id = "google-tag-manager";
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtm.js?id=GTM-TRDXKM5N";
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
