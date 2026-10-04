"use client";

import { useCourse } from "@/components/CourseProvider";
import { breakdown } from "@/lib/countdown";
import { useNow } from "@/lib/useNow";

const pad = (n: number) => String(n).padStart(2, "0");

/** The large hero countdown. Same target and same shared clock as the compact header countdown. */
export function Countdown() {
  const course = useCourse();
  const now = useNow(course.nowMs);
  const { left, days, hours, minutes, seconds } = breakdown(course.startsAtMs, now);

  if (left === 0) {
    return <p role="status" className="text-[13px] font-bold uppercase tracking-[1.4px] text-vls-gold">The live session has begun — registration is closed.</p>;
  }
  const cells = [["Days", days], ["Hours", hours], ["Minutes", minutes], ["Seconds", seconds]] as const;
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-gold">Live session starts in</p>
      {/* Screen readers get one stable sentence; the ticking digits are hidden from them. */}
      <p className="sr-only">Live session begins {course.fullDate} at 6:00 PM IST.</p>
      <div role="timer" aria-hidden="true" className="mt-2 flex items-start gap-1.5 min-[360px]:gap-2 sm:gap-3">
        {cells.map(([label, value], i) => (
          <div key={label} className="flex items-start gap-1.5 min-[360px]:gap-2 sm:gap-3">
            <div className="min-w-[46px] text-center min-[360px]:min-w-[52px] sm:min-w-[60px]">
              <p className="font-serif text-[28px] font-medium leading-none tabular-nums text-white sm:text-[32px]">{pad(value)}</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[1.2px] text-[#9a9a96]">{label}</p>
            </div>
            {i < cells.length - 1 && <span className="font-serif text-[24px] leading-none text-white/30">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
