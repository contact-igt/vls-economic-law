"use client";

import { useCourse } from "@/components/CourseProvider";

/** Session details for the registration card, split into short lines so nothing overflows on narrow phones. */
export function SessionSummary() {
  const course = useCourse();
  return (
    <div className="mt-3 border-y border-vls-border py-3">
      <p className="text-[12px] font-extrabold uppercase tracking-[1.2px] text-vls-black">{course.sessionHeading}</p>
      <p className="mt-1 text-[14px] text-vls-black">{course.time} · {course.duration}</p>
      {course.feeText && (
        <p className="mt-2 flex items-baseline justify-between">
          <span className="text-[12px] uppercase tracking-[1.2px] text-vls-muted">Registration fee</span>
          <span className="font-serif text-[24px] font-medium leading-none text-vls-black">{course.feeText}</span>
        </p>
      )}
    </div>
  );
}
