"use client";

import Image from "next/image";
import { useCourse } from "@/components/CourseProvider";

/**
 * Payment reassurance shown under the registration button (hero and final form). The badge is Razorpay's own
 * merchant badge, unmodified, self-hosted. It makes no claim beyond "payments powered by Razorpay".
 */
export function PaymentTrust() {
  const course = useCourse();
  if (!course.isPaid) return null;
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <a href="https://razorpay.com/" target="_blank" rel="noopener">
        <Image
          src="/brands/razorpay/badge-light.png"
          width={113}
          height={45}
          alt="Secure payments powered by Razorpay"
          unoptimized
          className="h-[45px] w-[113px]"
        />
      </a>
      <p className="text-[12px] leading-relaxed text-vls-muted">
        {course.feeText} one-time registration · Confirmation after successful payment
      </p>
      <p className="text-[11px] leading-relaxed text-vls-muted">{course.deadlineNote}</p>
      {course.seatsLabel && <p className="text-[12px] font-semibold text-vls-black">{course.seatsLabel}</p>}
    </div>
  );
}
