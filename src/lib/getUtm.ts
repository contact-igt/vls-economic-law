export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];

export function getUtm(key: UtmKey): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}
