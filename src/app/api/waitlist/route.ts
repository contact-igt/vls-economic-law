import { NextResponse } from "next/server";
import { programConfig } from "@/lib/course";
import { getRegistrationAction } from "@/lib/programStatus";
import type { StudentDetails } from "@/lib/razorpay";
import { recordWaitlistLead } from "@/lib/registrations";

export const runtime = "nodejs";

const str = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export async function POST(req: Request) {
  // While paid registration is open, visitors register and pay; the waitlist only exists once it closes.
  if (getRegistrationAction(programConfig) === "payment") {
    return NextResponse.json({ error: "Registration is open — please register and pay to reserve your seat." }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const email = str(body.email).toLowerCase();
  const mobile = str(body.mobile, 10);
  const name = str(body.name, 100);
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^[0-9]{10}$/.test(mobile)) {
    return NextResponse.json({ error: "Valid name, email and 10-digit mobile are required" }, { status: 400 });
  }
  const lead: StudentDetails = {
    name, email, mobile,
    cta_source: str(body.cta_source, 30),
    ip: (req.headers.get("x-forwarded-for") || "").split(",")[0].trim().slice(0, 64),
    utm_source: str(body.utm_source), utm_medium: str(body.utm_medium), utm_campaign: str(body.utm_campaign),
    utm_term: str(body.utm_term), utm_content: str(body.utm_content),
  };

  try {
    await recordWaitlistLead({ ...lead, createdAt: new Date().toISOString() });
    return NextResponse.json({ status: "waitlist", name, courseName: programConfig.courseName });
  } catch (error) {
    console.error("waitlist write failed:", error);
    return NextResponse.json({ error: "We couldn't add you to the waitlist. Please try again or call us." }, { status: 502 });
  }
}
