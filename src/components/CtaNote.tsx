"use client";

import { useCourse } from "@/components/CourseProvider";

/** Two short lines under a payment CTA (text only — the Razorpay badge lives next to the payment form). */
export function CtaNote({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const course = useCourse();
  if (!course.isPaid) return null;
  return (
    <div className={`text-[12px] leading-relaxed ${dark ? "text-[#a8a8a4]" : "text-vls-muted"} ${className}`}>
      <p>Secure payments powered by Razorpay</p>
      <p>Registration confirmed after successful payment.</p>
      {course.seatsLabel && <p className="font-semibold">{course.seatsLabel}</p>}
    </div>
  );
}
