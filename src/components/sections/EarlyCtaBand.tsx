"use client";

import { Container } from "../ui/Container";
import { PrimaryLink } from "../ui/Button";
import { CtaNote } from "../CtaNote";
import { useCourse } from "@/components/CourseProvider";

export function EarlyCtaBand() {
  const course = useCourse();
  return (
    <section className="bg-vls-near-black py-6">
      <Container className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-gold">
            {course.name}
          </p>
          <p className="mt-1.5 text-[14px] text-[#c8c8c4]">{course.bandBlurb}</p>
        </div>
        <div><PrimaryLink href="#register-form">{course.ctaLabel}</PrimaryLink><CtaNote dark className="mt-2 max-w-xs" /></div>
      </Container>
    </section>
  );
}
