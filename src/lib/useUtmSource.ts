"use client";

import { useEffect } from "react";
import { UTM_KEYS } from "./getUtm";

const SOURCE_ALIASES: Record<string, string> = {
  fb: "facebook.com",
  ig: "instagram.com",
  yt: "youtube.com",
  li: "linkedin.com",
  tw: "twitter.com",
  gads: "google.com",
};

const DIRECT = {
  utm_source: "direct",
  utm_medium: "none",
  utm_campaign: "none",
  utm_term: "none",
  utm_content: "none",
} as const;

/**
 * Captures UTM parameters (or the referrer) into localStorage once per visit.
 * Mirrors the shared VLS landing-page behaviour. First write wins — an existing
 * value is never overwritten.
 */
export function useUtmSource() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const data: Record<string, string | null> = {
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        utm_term: params.get("utm_term"),
        utm_content: params.get("utm_content"),
      };

      if (data.utm_source) {
        data.utm_source = SOURCE_ALIASES[data.utm_source.toLowerCase()] || data.utm_source;
      } else if (document.referrer) {
        data.utm_source = new URL(document.referrer).hostname.replace(/^www\./, "");
      } else {
        data.utm_source = "direct";
      }

      const src = data.utm_source ?? "direct";
      const resolved: Record<string, string> =
        src === "direct" || src.includes("localhost") || src.includes("127.0.0.1")
          ? { ...DIRECT }
          : Object.fromEntries(UTM_KEYS.map((k) => [k, data[k] ?? ""]));

      for (const key of UTM_KEYS) {
        if (!window.localStorage.getItem(key)) {
          window.localStorage.setItem(key, resolved[key] ?? "");
        }
      }
    } catch {
      for (const key of UTM_KEYS) {
        try {
          window.localStorage.setItem(key, DIRECT[key]);
        } catch {
          /* storage unavailable — ignore */
        }
      }
    }
  }, []);
}
