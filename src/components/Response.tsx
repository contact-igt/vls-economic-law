"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Container } from "./ui/Container";
import { useCourse } from "@/components/CourseProvider";
import { readProof } from "@/lib/paymentStorage";
import { trackVerifiedPurchase } from "@/lib/tracking";
import { googleCalendarUrl, icsContent } from "@/lib/calendar";

export type ErrorReason = "failed" | "unverified" | "unconfirmed";

type Verified = {
  paymentId: string; orderId: string; amount: number; courseName: string;
  name: string; email: string; mobile: string;
};
type Phase =
  | { kind: "loading" }
  | { kind: "paid"; data: Verified }
  | { kind: "pending" }
  | { kind: "unverified"; hasProof: boolean };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Success is shown ONLY when /api/verify-payment confirms (signature + captured payment) the proof
// the browser holds. A URL, a query string or local storage alone can never produce "confirmed".
function useVerification() {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      const proof = readProof();
      if (!proof) {
        if (active) setPhase({ kind: "unverified", hasProof: false });
        return;
      }
      for (let i = 0; i < 4 && active; i++) {
        try {
          const response = await fetch("/api/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(proof),
          });
          const data = await response.json().catch(() => ({}));
          if (response.ok && data?.status === "paid") {
            if (active) setPhase({ kind: "paid", data });
            return;
          }
          if (response.status === 400) {
            if (active) setPhase({ kind: "unverified", hasProof: true });
            return;
          }
        } catch {
          /* network hiccup — retry */
        }
        if (i < 3) await sleep(2000);
      }
      if (active) setPhase({ kind: "pending" });
    })();
    return () => {
      active = false;
    };
  }, [attempt]);

  const recheck = () => {
    setPhase({ kind: "loading" });
    setAttempt((n) => n + 1);
  };
  return { phase, recheck };
}

export function Response({ variant, reason = "failed" }: { variant: "thank-you" | "error"; reason?: ErrorReason }) {
  return variant === "thank-you" ? <ThankYou /> : <PaymentProblem reason={reason} />;
}

function ThankYou() {
  const course = useCourse();
  const { phase, recheck } = useVerification();

  // Purchase conversion: only after server verification, once per payment id (also across refreshes).
  const paidData = phase.kind === "paid" ? phase.data : null;
  useEffect(() => {
    if (paidData) trackVerifiedPurchase(paidData.paymentId, paidData.amount);
  }, [paidData]);

  if (phase.kind === "paid") return <Confirmed data={phase.data} />;

  const copy =
    phase.kind === "loading"
      ? { title: "Confirming your payment…", body: "Please wait while we verify your payment with Razorpay." }
      : phase.kind === "pending"
        ? { title: "We're still confirming your payment", body: "Confirmation is taking a little longer than usual. Please don't pay again — check the status in a moment." }
        : { title: "We couldn't verify this payment yet", body: "If you completed payment, please wait a moment and try again." };

  return (
    <Shell>
      <h1 className="font-serif text-[28px] font-medium leading-tight text-vls-black md:text-[34px]">{copy.title}</h1>
      <p role="status" aria-busy={phase.kind === "loading"} className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-vls-muted">{copy.body}</p>
      <Help course={course} />
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {phase.kind !== "loading" && (phase.kind === "pending" || phase.hasProof) && (
          <button type="button" onClick={recheck} className="inline-flex h-12 items-center justify-center bg-vls-red px-6 text-[13px] font-bold text-vls-white transition-colors hover:bg-vls-red-dark">
            Check Payment Status
          </button>
        )}
        <HomeLink />
      </div>
    </Shell>
  );
}

function Confirmed({ data }: { data: Verified }) {
  const course = useCourse();
  const downloadIcs = () => {
    const url = URL.createObjectURL(new Blob([icsContent()], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "economic-laws-practice-vls.ics";
    link.click();
    URL.revokeObjectURL(url);
  };
  const steps = [
    "Your payment and registration have been recorded.",
    "Keep your registered mobile number and email accessible.",
    "VLS Law Academy will share the session access/joining information through the registered contact details.",
    `Join the session on ${course.fullDate} before 6:00 PM IST.`,
  ];
  return (
    <section className="bg-vls-off-white py-14 md:py-20">
      <Container className="max-w-[720px]">
        <div className="text-center">
          <span aria-hidden="true" className="mx-auto flex h-12 w-12 items-center justify-center border border-vls-red">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--vls-red)" strokeWidth="2.5" strokeLinecap="square"><path d="M4 12.5l5 5 11-11" /></svg>
          </span>
          <p className="eyebrow mt-5">Registration Confirmed</p>
          <h1 className="mt-3 font-serif text-[32px] font-medium leading-tight text-vls-black md:text-[42px]">Your Seat Is Confirmed.</h1>
          <p className="mx-auto mt-4 max-w-lg text-[16px] leading-relaxed text-vls-muted">
            Thank you for registering with VLS Law Academy. Your registration for the {data.courseName} Foundation Course has been confirmed.
          </p>
        </div>

        <div className="mt-8 border border-vls-border bg-vls-white">
          <div className="border-b border-vls-border p-5 sm:p-6">
            <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-red">Foundation Course</p>
            <p className="mt-1 font-serif text-[24px] font-medium text-vls-black">{data.courseName}</p>
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-5 p-5 sm:grid-cols-4 sm:p-6">
            <Detail label="Date" value={course.fullDate} />
            <Detail label="Time" value={course.time} />
            <Detail label="Duration" value={course.duration} />
            <Detail label="Fee" value={`₹${data.amount} Paid`} />
          </dl>
        </div>

        <div className="mt-4 border border-vls-border bg-vls-white p-5 sm:p-6">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-muted">Payment Reference</h2>
          <dl className="mt-4 space-y-2.5 text-[14px]">
            <Row label="Name" value={data.name} />
            <Row label="Email" value={data.email} />
            <Row label="Mobile" value={data.mobile} />
            <Row label="Course" value={data.courseName} />
            <Row label="Amount paid" value={`₹${data.amount}`} />
            <Row label="Payment ID" value={data.paymentId} />
          </dl>
        </div>

        <div className="mt-4 border border-vls-border bg-vls-white p-5 sm:p-6">
          <h2 className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-muted">What Happens Next</h2>
          <ol className="mt-4 flex flex-col gap-3.5">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-4 text-[15px] leading-relaxed text-vls-black">
                <span className="font-serif text-[18px] leading-snug text-vls-red">{String(i + 1).padStart(2, "0")}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center bg-vls-red px-6 text-[13px] font-bold text-vls-white transition-colors hover:bg-vls-red-dark">
            Add to Google Calendar
          </a>
          <button type="button" onClick={downloadIcs} className="inline-flex h-12 items-center justify-center border border-vls-border bg-vls-white px-6 text-[13px] font-bold text-vls-black transition-colors hover:bg-vls-card">
            Download .ics
          </button>
        </div>

        <div className="mt-6 text-center">
          <Help course={course} />
          <div className="mt-6"><HomeLink /></div>
        </div>
      </Container>
    </section>
  );
}

function PaymentProblem({ reason }: { reason: ErrorReason }) {
  const course = useCourse();
  const unconfirmed = reason !== "failed";
  return (
    <Shell>
      <h1 className="font-serif text-[28px] font-medium leading-tight text-vls-black md:text-[34px]">
        {unconfirmed ? "We're confirming your payment" : "Payment not completed"}
      </h1>
      <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-vls-muted">
        {unconfirmed
          ? "We couldn't confirm your payment automatically yet. If the payment went through it will be recorded once Razorpay confirms it. Please don't pay again."
          : "Your seat has not been confirmed yet."}
      </p>
      <Help course={course} />
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {!unconfirmed && (
          <Link href="/#hero-register-form" className="inline-flex h-12 items-center justify-center bg-vls-red px-6 text-[13px] font-bold text-vls-white transition-colors hover:bg-vls-red-dark">
            Try Payment Again
          </Link>
        )}
        <HomeLink />
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section className="flex min-h-[60vh] items-center bg-vls-off-white py-14 md:py-20">
      <Container className="max-w-[560px] text-center">{children}</Container>
    </section>
  );
}

function Help({ course }: { course: ReturnType<typeof useCourse> }) {
  return (
    <p className="mt-5 text-[14px] text-vls-muted">
      Need help with your registration?{" "}
      <a href={`tel:${course.phone}`} className="font-bold text-vls-red underline underline-offset-2">{course.phoneDisplay}</a>
    </p>
  );
}

function HomeLink() {
  return (
    <Link href="/" className="inline-flex h-12 items-center justify-center bg-vls-black px-6 text-[13px] font-bold text-vls-white transition-colors hover:bg-vls-near-black">
      Back to Home
    </Link>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[1.2px] text-vls-muted">{label}</dt>
      <dd className="mt-1 text-[15px] font-semibold leading-snug text-vls-black">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-vls-muted">{label}</dt>
      <dd className="break-all text-right font-semibold text-vls-black">{value}</dd>
    </div>
  );
}
