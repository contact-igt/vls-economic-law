// Server-only: persists VERIFIED paid registrations and waitlist leads. Never import from a client component.
import { programConfig } from "./course";
import type { PaidRegistration, StudentDetails } from "./razorpay";

export type WaitlistLead = StudentDetails & { createdAt: string };

// Registration + waitlist Google Sheet (Apps Script web app). Used only on the server, never shipped to the browser.
export const GOOGLE_SHEET_WEBAPP_URL =
  "https://script.google.com/macros/s/AKfycbw0MR0d0KVZv1EduWCk4N5La_k07KqLyOdCJiL2OFFLtWCigM8Uw0kF0y7Gy795mOok/exec";

function backendBase() {
  const target = (process.env.NEXT_PUBLIC_API_SERVER || "localhost").toLowerCase();
  if (target === "production") return process.env.NEXT_PUBLIC_PRODUCTION_API_URL || "";
  if (target === "stage") return process.env.NEXT_PUBLIC_STAGE_API_URL || "";
  return process.env.NEXT_PUBLIC_LOCALHOST_API_URL || "http://localhost:8000/api/v1";
}

// One in-flight/finished write per payment id inside this server process. The sheet's own
// payment-id upsert (scripts/google-sheet-webapp.gs) is the durable idempotency authority.
const writes = new Map<string, Promise<{ duplicate: boolean }>>();

async function postSheet(fields: Record<string, string>): Promise<{ duplicate: boolean }> {
  const params = new URLSearchParams(fields);
  const response = await fetch(GOOGLE_SHEET_WEBAPP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!response.ok) throw new Error(`Registration sheet responded ${response.status}`);
  const body = await response.json().catch(() => ({}) as { result?: string });
  if (body?.result === "error") throw new Error("Registration sheet rejected the row");
  return { duplicate: body?.result === "duplicate" };
}

function writeSheet(r: PaidRegistration): Promise<{ duplicate: boolean }> {
  return postSheet({
    name: r.name, email: r.email, mobile: `+91${r.mobile}`, amount: String(r.amount),
    registered_date: r.createdAt, programm_date: programConfig.classStartAt,
    razorpay_order_id: r.orderId, razorpay_payment_id: r.paymentId, razorpay_signature: r.signature ?? "",
    payment_status: r.paymentStatus, captured: "true", page_name: r.programmeId, ip_address: r.ip,
    utm_source: r.utm_source, utm_medium: r.utm_medium, utm_campaign: r.utm_campaign,
    utm_term: r.utm_term, utm_content: r.utm_content,
    payment_method: r.paymentMethod, currency: r.currency, paid_at: r.paidAt, course_name: r.courseName, cta_source: r.cta_source,
  });
}

async function postBackend(payload: Record<string, unknown>) {
  try {
    // Invictus admin backend: POST /api/v1/vls-economic-laws/register (VLS Admin → Economic Laws & Practice).
    const response = await fetch(`${backendBase()}/vls-economic-laws/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Client-Key": process.env.NEXT_PUBLIC_CLIENT_KEY || "vls_law" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(`VLS backend rejected the lead (${response.status}):`, await response.text().catch(() => ""));
    }
  } catch (error) {
    console.error("VLS backend lead write failed (sheet row already recorded):", error);
  }
}

function writeBackend(r: PaidRegistration) {
  return postBackend({
    name: r.name, email: r.email, mobile: `+91${r.mobile}`, amount: r.amount,
    registered_date: r.createdAt, programm_date: programConfig.classStartAt,
    razorpay_order_id: r.orderId, razorpay_payment_id: r.paymentId, razorpay_signature: r.signature ?? "",
    payment_status: r.paymentStatus, captured: true, page_name: r.programmeId, ip_address: r.ip,
    utm_source: r.utm_source, utm_medium: r.utm_medium, utm_campaign: r.utm_campaign,
    utm_term: r.utm_term, utm_content: r.utm_content,
  });
}

/**
 * Records a waitlist lead (registration closed): same sheet and backend as paid rows, segmented by
 * payment_status "waitlist", a zero amount (VLS landing-page convention) and every payment field left empty.
 */
export async function recordWaitlistLead(l: WaitlistLead) {
  const common = {
    name: l.name, email: l.email, mobile: `+91${l.mobile}`,
    registered_date: l.createdAt, programm_date: programConfig.classStartAt,
    razorpay_order_id: "", razorpay_payment_id: "", razorpay_signature: "",
    payment_status: "waitlist", page_name: programConfig.pageName, ip_address: l.ip,
    utm_source: l.utm_source, utm_medium: l.utm_medium, utm_campaign: l.utm_campaign,
    utm_term: l.utm_term, utm_content: l.utm_content,
  };
  await postSheet({
    ...common, amount: "0", captured: "", payment_method: "", currency: "", paid_at: "",
    course_name: programConfig.courseName, cta_source: l.cta_source,
  });
  await postBackend({ ...common, amount: 0, captured: false });
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
