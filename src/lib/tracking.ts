type Tracker = {
  dataLayer?: unknown[];
  fbq?: (...args: unknown[]) => void;
  gtag?: (...args: unknown[]) => void;
};

const fired = new Set<string>();

/**
 * Fires the purchase conversion for a payment the server has verified. Call it only from the
 * success page (which is reachable only after /api/verify-payment returned "paid"). Deduplicated per
 * payment id across refreshes. Pixel / GTM / gtag are used only if the site has loaded them.
 */
export function trackVerifiedPurchase(paymentId: string, value: number, currency = "INR") {
  if (typeof window === "undefined" || !paymentId || fired.has(paymentId)) return;
  fired.add(paymentId);
  const flag = `vls_purchase_${paymentId}`;
  try {
    if (window.localStorage.getItem(flag)) return;
    window.localStorage.setItem(flag, "1");
  } catch {
    /* storage unavailable — the in-memory guard still prevents repeats on this page load */
  }
  const w = window as unknown as Tracker;
  const contentName = "Economic Laws & Practice";
  (w.dataLayer = w.dataLayer || []).push({
    event: "purchase",
    ecommerce: { transaction_id: paymentId, value, currency, items: [{ item_name: contentName, price: value, quantity: 1 }] },
  });
  w.fbq?.("track", "Purchase", { value, currency, content_name: contentName }, { eventID: paymentId });
  w.gtag?.("event", "purchase", { transaction_id: paymentId, value, currency });
}
