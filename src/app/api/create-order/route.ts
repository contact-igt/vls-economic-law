import { NextResponse } from "next/server";
import { programConfig } from "@/lib/course";
import { getRegistrationAction } from "@/lib/programStatus";
import { createOrder, credentials, feeInPaise, type StudentDetails } from "@/lib/razorpay";

export const runtime = "nodejs";

const str = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(req: Request) {
  // Server-side registration gate: closed (including after the class start time) or unpriced => no order.
  if (getRegistrationAction(programConfig) !== "payment") {
    return NextResponse.json({ error: "Payment registration is not open" }, { status: 403 });
  }

  const amountPaise = feeInPaise();
  const creds = credentials();
  if (amountPaise === null || !creds) {
    return NextResponse.json({ error: "Payment is not configured" }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Only student details are read from the browser. Any client-supplied amount is ignored.
  const email = str(body.email).toLowerCase();
  const mobile = str(body.mobile, 10);
  const name = str(body.name, 100);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[0-9]{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Valid name, email and 10-digit mobile are required" }, { status: 400 });
  }
  const student: StudentDetails = {
    name, email, mobile,
    cta_source: str(body.cta_source, 30),
    ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64),
    utm_source: str(body.utm_source), utm_medium: str(body.utm_medium), utm_campaign: str(body.utm_campaign),
    utm_term: str(body.utm_term), utm_content: str(body.utm_content),
  };

  try {
    const order = await createOrder(creds, amountPaise, student);
    return NextResponse.json({ orderId: order.id, amount: order.amount, currency: order.currency, keyId: creds.keyId });
  } catch (error) {
    console.error("create-order error:", error);
    return NextResponse.json({ error: "Unable to create payment order" }, { status: 502 });
  }
}
