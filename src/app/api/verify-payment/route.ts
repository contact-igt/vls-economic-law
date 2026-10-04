import { NextResponse } from "next/server";
import { confirmPayment, credentials, maskEmail, maskMobile, verifyCheckoutSignature } from "@/lib/razorpay";
import { recordPaidRegistration } from "@/lib/registrations";

export const runtime = "nodejs";

const field = (value: unknown) => (typeof value === "string" && value.length > 0 && value.length <= 100 ? value : "");

export async function POST(req: Request) {
  const creds = credentials();
  if (!creds) return NextResponse.json({ error: "Payment is not configured" }, { status: 500 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const orderId = field(body.razorpay_order_id);
  const paymentId = field(body.razorpay_payment_id);
  const signature = field(body.razorpay_signature);
  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: "Payment details are required" }, { status: 400 });
  }

  // 1. The Checkout signature must be valid for this order/payment pair under the server-held secret.
  if (!verifyCheckoutSignature(orderId, paymentId, signature, creds.keySecret)) {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }

  // 2. Razorpay itself must confirm the payment is captured, for this order and the configured fee.
  // Not gated by the registration deadline: a payment that was already taken must still be honoured.
  try {
    const confirmation = await confirmPayment(creds, paymentId, orderId);
    if (confirmation.state === "pending") return NextResponse.json({ status: "pending" }, { status: 202 });
    if (confirmation.state === "invalid") {
      console.error("verify-payment rejected:", paymentId, confirmation.reason);
      return NextResponse.json({ error: "Payment could not be verified" }, { status: 400 });
    }
    const registration = { ...confirmation.registration, signature };
    try {
      await recordPaidRegistration(registration);
    } catch (error) {
      // Payment is verified; the webhook is the backstop that records it if this write failed.
      console.error("verify-payment: registration write failed for", paymentId, error);
    }
    // Only safe, masked details are returned — and only for a signature-verified, captured payment.
    return NextResponse.json({
      status: "paid", paymentId: registration.paymentId, orderId: registration.orderId, amount: registration.amount,
      currency: registration.currency, courseName: registration.courseName, name: registration.name,
      email: maskEmail(registration.email), mobile: maskMobile(registration.mobile),
    });
  } catch (error) {
    console.error("verify-payment error:", error);
    return NextResponse.json({ error: "Payment verification is temporarily unavailable" }, { status: 502 });
  }
}
