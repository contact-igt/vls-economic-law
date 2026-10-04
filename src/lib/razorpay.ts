// Server-only Razorpay helpers. Never import this from a client component.
import { createHmac, timingSafeEqual } from "node:crypto";
import { programConfig } from "./course";

const API = "https://api.razorpay.com/v1";
const RECEIPT_PREFIX = "economic_laws_";

export type RazorpayOrder = { id: string; amount: number; currency: string; receipt?: string; notes?: Record<string, string> };
export type RazorpayPayment = { id: string; order_id: string; amount: number; currency: string; status: string; method?: string; created_at?: number };

export type StudentDetails = {
  name: string; email: string; mobile: string; ip: string; cta_source: string;
  utm_source: string; utm_medium: string; utm_campaign: string; utm_term: string; utm_content: string;
};

export type PaidRegistration = StudentDetails & {
  programmeId: string; courseName: string; orderId: string; paymentId: string;
  amount: number; currency: string; paymentStatus: "paid"; paymentMethod: string;
  createdAt: string; paidAt: string;
};

/** Key secret is read from a server-only variable. NEXT_PUBLIC_* values are bundled into the browser and are never used. */
export function credentials() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  return keyId && keySecret ? { keyId, keySecret } : null;
}

export function feeInPaise() {
  const { fee } = programConfig;
  return typeof fee === "number" && Number.isFinite(fee) && fee > 0 ? Math.round(fee * 100) : null;
}

async function api<T>(creds: { keyId: string; keySecret: string }, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: "Basic " + Buffer.from(`${creds.keyId}:${creds.keySecret}`).toString("base64"),
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) throw new Error(`Razorpay ${path} responded ${response.status}`);
  return response.json() as Promise<T>;
}

export function createOrder(creds: { keyId: string; keySecret: string }, amountPaise: number, student: StudentDetails) {
  return api<RazorpayOrder>(creds, "/orders", {
    method: "POST",
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `${RECEIPT_PREFIX}${Date.now()}`,
      payment_capture: 1,
      notes: { programme_id: programConfig.pageName, ...student },
    }),
  });
}

const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  return safeEqual(createHmac("sha256", secret).update(rawBody).digest("hex"), signature);
}

export const maskEmail = (email: string) => {
  const [user = "", domain = ""] = email.split("@");
  return user ? `${user[0]}${"•".repeat(Math.max(2, Math.min(user.length - 1, 6)))}@${domain}` : "";
};
export const maskMobile = (mobile: string) => (mobile.length === 10 ? `+91 ${mobile.slice(0, 2)}••••${mobile.slice(6)}` : "");

export type Confirmation =
  | { state: "paid"; registration: PaidRegistration }
  | { state: "pending" }
  | { state: "invalid"; reason: string };

/**
 * Confirms a payment against Razorpay itself (never against client-supplied or webhook-body data):
 * the payment must be captured, belong to an order created by this programme, and match the configured fee.
 */
export async function confirmPayment(
  creds: { keyId: string; keySecret: string },
  paymentId: string,
  expectedOrderId?: string,
): Promise<Confirmation> {
  const payment = await api<RazorpayPayment>(creds, `/payments/${encodeURIComponent(paymentId)}`);
  if (expectedOrderId && payment.order_id !== expectedOrderId) return { state: "invalid", reason: "order mismatch" };
  if (payment.status === "authorized" || payment.status === "created") return { state: "pending" };
  if (payment.status !== "captured") return { state: "invalid", reason: `payment ${payment.status}` };

  const order = await api<RazorpayOrder>(creds, `/orders/${encodeURIComponent(payment.order_id)}`);
  const notes = order.notes ?? {};
  if (notes.programme_id !== programConfig.pageName) return { state: "invalid", reason: "not this programme" };
  if (order.amount !== feeInPaise() || payment.amount !== order.amount || payment.currency !== "INR") {
    return { state: "invalid", reason: "amount mismatch" };
  }

  return {
    state: "paid",
    registration: {
      programmeId: programConfig.pageName,
      courseName: programConfig.courseName,
      name: notes.name ?? "", email: notes.email ?? "", mobile: notes.mobile ?? "", ip: notes.ip ?? "", cta_source: notes.cta_source ?? "",
      utm_source: notes.utm_source ?? "", utm_medium: notes.utm_medium ?? "", utm_campaign: notes.utm_campaign ?? "",
      utm_term: notes.utm_term ?? "", utm_content: notes.utm_content ?? "",
      orderId: order.id, paymentId: payment.id,
      amount: payment.amount / 100, currency: payment.currency, paymentStatus: "paid",
      paymentMethod: payment.method ?? "",
      createdAt: new Date().toISOString(),
      paidAt: payment.created_at ? new Date(payment.created_at * 1000).toISOString() : new Date().toISOString(),
    },
  };
}
