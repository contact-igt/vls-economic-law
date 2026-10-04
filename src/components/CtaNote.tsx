"use client";

import { useCourse } from "@/components/CourseProvider";

/** Compact purchase reassurance shown directly under a payment CTA. Makes no claim beyond what the checkout does. */
export function CtaNote({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  const course = useCourse();
  if (!course.isPaid) return null;
  return (
    <div className={`text-[12px] leading-relaxed ${dark ? "text-[#a8a8a4]" : "text-vls-muted"} ${className}`}>
      <p>Secure payment via Razorpay · {course.deadlineNote}</p>
      <p>Your registration is confirmed only after successful payment.</p>
      {course.seatsLabel && <p className="font-semibold">{course.seatsLabel}</p>}
    </div>
  );
}
