"use client";

import { useEffect, useRef } from "react";

const adsId = "AW-18578712774";

export default function GoogleAdsConversion({
  transactionId,
  value,
  currency,
}: {
  transactionId: string;
  value: number;
  currency: string;
}) {
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === transactionId) return;
    sent.current = transactionId;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", adsId);
    window.gtag("event", "conversion", {
      send_to: `${adsId}/4q77CLjQzbkdEMbRgptF`,
      transaction_id: transactionId,
      value,
      currency,
    });

    if (!document.getElementById("google-ads-tag")) {
      const script = document.createElement("script");
      script.id = "google-ads-tag";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${adsId}`;
      document.head.appendChild(script);
    }
  }, [transactionId, value, currency]);

  return null;
}
