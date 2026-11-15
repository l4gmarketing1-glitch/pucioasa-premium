"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    _mfq?: unknown[][];
    mouseflow?: { start: () => void; stop: () => void };
  }
}

function isAdmin(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export default function Mouseflow() {
  const pathname = usePathname();
  const stoppedForAdmin = useRef(false);

  useEffect(() => {
    if (isAdmin(pathname)) {
      window.mouseflow?.stop();
      stoppedForAdmin.current = true;
      return;
    }

    if (document.getElementById("mouseflow-tracking")) {
      // Restart only when returning from a route where recording was stopped.
      if (stoppedForAdmin.current) window.mouseflow?.start();
      stoppedForAdmin.current = false;
      return;
    }

    window._mfq = window._mfq || [];
    stoppedForAdmin.current = false;
    const script = document.createElement("script");
    script.id = "mouseflow-tracking";
    script.type = "text/javascript";
    script.defer = true;
    script.src = "https://cdn.mouseflow.com/projects/eea432cb-d459-4bac-a917-cf8e4e67ac74.js";
    script.onload = () => {
      if (isAdmin(window.location.pathname)) window.mouseflow?.stop();
    };
    document.head.appendChild(script);
  }, [pathname]);

  return null;
}
