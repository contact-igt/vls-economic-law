import { NextResponse } from "next/server";
import { confirmPayment, credentials, verifyWebhookSignature } from "@/lib/razorpay";
import { recordPaidRegistration } from "@/lib/registrations";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const creds = credentials();
  if (!secret || !creds) return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") || "";
  if (!signature || !verifyWebhookSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string } } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only the payment id is taken from the event; everything else is re-read from Razorpay.
  const paymentId = event.payload?.payment?.entity?.id;
  if ((event.event !== "payment.captured" && event.event !== "order.paid") || !paymentId) {
    return NextResponse.json({ status: "ignored" });
  }

  try {
    const confirmation = await confirmPayment(creds, paymentId);
    // Orders from other VLS pages on the same merchant account are acknowledged and ignored.
    if (confirmation.state !== "paid") return NextResponse.json({ status: "ignored" });
    const result = await recordPaidRegistration(confirmation.registration);
    return NextResponse.json({ status: result.duplicate ? "duplicate" : "recorded" });
  } catch (error) {
    // Non-2xx makes Razorpay retry the delivery.
    console.error("razorpay-webhook error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
