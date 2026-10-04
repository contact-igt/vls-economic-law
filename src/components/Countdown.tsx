"use client";

import { useEffect, useState } from "react";
import { useCourse } from "@/components/CourseProvider";

const pad = (n: number) => String(n).padStart(2, "0");

/** Counts down to the absolute class-start timestamp in the central config — identical for every visitor. */
export function Countdown() {
  const course = useCourse();
  // Starts from the server-rendered clock so hydration matches, then follows the visitor's clock.
  const [now, setNow] = useState(course.nowMs);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = Math.max(0, course.startsAtMs - now);
  if (left === 0) {
    return <p role="status" className="text-[13px] font-bold uppercase tracking-[1.4px] text-vls-gold">The live session has begun — registration is closed.</p>;
  }
  const s = Math.floor(left / 1000);
  const cells = [
    ["Days", Math.floor(s / 86400)], ["Hours", Math.floor((s % 86400) / 3600)],
    ["Minutes", Math.floor((s % 3600) / 60)], ["Seconds", s % 60],
  ] as const;
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-gold">Live session starts in</p>
      <div role="timer" aria-live="off" className="mt-2 flex items-start gap-1.5 min-[360px]:gap-2 sm:gap-3">
        {cells.map(([label, value], i) => (
          <div key={label} className="flex items-start gap-1.5 min-[360px]:gap-2 sm:gap-3">
            <div className="min-w-[46px] text-center min-[360px]:min-w-[52px] sm:min-w-[60px]">
              <p className="font-serif text-[28px] font-medium leading-none tabular-nums text-white sm:text-[32px]">{pad(value)}</p>
              <p className="mt-1.5 text-[10px] uppercase tracking-[1.2px] text-[#9a9a96]">{label}</p>
            </div>
            {i < cells.length - 1 && <span aria-hidden="true" className="font-serif text-[24px] leading-none text-white/30">:</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
