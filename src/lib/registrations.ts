// Server-only: persists a VERIFIED paid registration. Never import from a client component.
import { programConfig } from "./course";
import type { PaidRegistration } from "./razorpay";

function backendBase() {
  const target = (process.env.NEXT_PUBLIC_API_SERVER || "localhost").toLowerCase();
  if (target === "production") return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || "";
  if (target === "stage") return process.env.NEXT_PUBLIC_STAGE_API_URL || "";
  return process.env.NEXT_PUBLIC_LOCALHOST_API_URL || "http://localhost:8000/api/v1";
}

// One in-flight/finished write per payment id inside this server process. The sheet's own
// payment-id upsert (scripts/google-sheet-webapp.gs) is the durable idempotency authority.
const writes = new Map<string, Promise<{ duplicate: boolean }>>();

async function writeSheet(r: PaidRegistration): Promise<{ duplicate: boolean }> {
  // Deployment URL and shared token are configuration, never source: the Apps Script accepts posts from anyone who has them.
  const sheetUrl = process.env.GOOGLE_SHEET_WEBAPP_URL;
  if (!sheetUrl) throw new Error("GOOGLE_SHEET_WEBAPP_URL is not configured");
  const params = new URLSearchParams({
    token: process.env.GOOGLE_SHEET_TOKEN || "",
    name: r.name, email: r.email, mobile: `+91${r.mobile}`, amount: String(r.amount),
    registered_date: r.createdAt, programm_date: programConfig.classStartAt,
    razorpay_order_id: r.orderId, razorpay_payment_id: r.paymentId, razorpay_signature: "",
    payment_status: r.paymentStatus, captured: "true", page_name: r.programmeId, ip_address: r.ip,
    utm_source: r.utm_source, utm_medium: r.utm_medium, utm_campaign: r.utm_campaign,
    utm_term: r.utm_term, utm_content: r.utm_content,
    payment_method: r.paymentMethod, currency: r.currency, paid_at: r.paidAt, course_name: r.courseName, cta_source: r.cta_source,
  });
  const response = await fetch(sheetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!response.ok) throw new Error(`Registration sheet responded ${response.status}`);
  const body = await response.json().catch(() => ({}) as { result?: string });
  if (body?.result === "error") throw new Error("Registration sheet rejected the row");
  return { duplicate: body?.result === "duplicate" };
}

async function writeBackend(r: PaidRegistration) {
  try {
    await fetch(`${backendBase()}/vls-economic-laws/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-Key": process.env.NEXT_PUBLIC_CLIENT_KEY || "vls_law" },
      body: JSON.stringify({
        name: r.name, email: r.email, mobile: `+91${r.mobile}`, amount: r.amount,
        registered_date: r.createdAt, programm_date: programConfig.classStartAt,
        razorpay_order_id: r.orderId, razorpay_payment_id: r.paymentId, razorpay_signature: "",
        payment_status: r.paymentStatus, captured: true, page_name: r.programmeId, ip_address: r.ip,
        utm_source: r.utm_source, utm_medium: r.utm_medium, utm_campaign: r.utm_campaign,
        utm_term: r.utm_term, utm_content: r.utm_content,
      }),
    });
  } catch (error) {
    console.error("VLS backend registration failed (sheet row already recorded):", error);
  }
}

/** Idempotent: the same payment id is written once; repeats resolve to { duplicate: true }. */
export function recordPaidRegistration(r: PaidRegistration): Promise<{ duplicate: boolean }> {
  const existing = writes.get(r.paymentId);
  if (existing) return existing.then(() => ({ duplicate: true }));
  const write = writeSheet(r).then(async (result) => {
    if (!result.duplicate) await writeBackend(r);
    return result;
  });
  writes.set(r.paymentId, write);
  write.catch(() => writes.delete(r.paymentId));
  return write;
}
