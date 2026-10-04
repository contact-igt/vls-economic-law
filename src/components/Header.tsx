"use client";

import { useCourse } from "@/components/CourseProvider";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "./ui/Container";
import { HeaderCta } from "./ui/Button";
import { useActiveSection } from "@/lib/useActiveSection";
import { breakdown } from "@/lib/countdown";
import { useNow } from "@/lib/useNow";
import { useExitedAbove, useMediaQuery } from "@/lib/useHeroExit";
import { scrollToRegistration } from "@/lib/registerTarget";
import { noteStickyCta } from "@/lib/ctaSource";

const NAV_LINKS = [
  { id: "why-this-course", label: "Why this course" },
  { id: "curriculum", label: "Curriculum" },
  { id: "faculty", label: "Faculty" },
  { id: "faqs", label: "FAQs" },
];

const NAV_IDS = NAV_LINKS.map((l) => l.id);

export function Header({ linkBase = "", showCta = true }: { linkBase?: string; showCta?: boolean }) {
  const course = useCourse();
  // ONE header, two states: normal navigation while the hero countdown + CTA are on screen, a compact
  // conversion state (desktop only) once they have scrolled away. Same shell height in both: no layout shift.
  const desktop = useMediaQuery("(min-width: 1024px)");
  const heroGone = useExitedAbove("hero-conversion");
  const converting = showCta && desktop && heroGone && course.isPaid;
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeId = useActiveSection(NAV_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-[border-color,box-shadow] duration-200 ${
        scrolled ? "border-vls-border shadow-[0_1px_12px_rgba(17,19,21,0.06)]" : "border-transparent"
      }`}
    >
      <Container className="grid h-[85px]">
        <div
          inert={converting}
          className={`col-start-1 row-start-1 flex items-center justify-between transition-[opacity,translate] motion-reduce:transition-none ${
            converting ? "pointer-events-none -translate-y-1.5 opacity-0 duration-200 ease-in" : "translate-y-0 opacity-100 duration-200 ease-out"
          }`}
        >
        <Link href={`${linkBase}#top`} className="flex items-center gap-3">
          <Image
            src="/assets/vls/brand/vls-logo.png"
            alt="VLS Law Academy"
            width={64}
            height={64}
            priority
          />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.id}
              href={`${linkBase}#${link.id}`}
              aria-current={activeId === link.id ? "true" : undefined}
              className={`text-[15px] transition-colors duration-150 ease-out hover:text-vls-red ${
                activeId === link.id ? "text-vls-red" : "text-vls-black"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Below 1024px the bottom dock is the one persistent Register Now, so the header carries none. */}
        <div className="hidden lg:block">
          {showCta && <HeaderCta href={`${linkBase}#register-form`}>{course.ctaLabel}</HeaderCta>}
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-[2px] w-6 bg-vls-black transition-transform duration-150 ease-out ${
              open ? "translate-y-[7px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-vls-black transition-opacity duration-150 ease-out ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`h-[2px] w-6 bg-vls-black transition-transform duration-150 ease-out ${
              open ? "-translate-y-[7px] -rotate-45" : ""
            }`}
          />
        </button>
        </div>
        {desktop && showCta && <ConversionLayer active={converting} linkBase={linkBase} />}
      </Container>

      {/* Always mounted so open/close is an interruptible CSS transition.
          grid-template-rows 0fr → 1fr animates to content height; `inert`
          removes the collapsed menu from tab/AT order. */}
      <div
        id="mobile-nav"
        inert={!open}
        className={`grid overflow-hidden border-vls-border bg-white transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          open ? "grid-rows-[1fr] border-t" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <nav aria-label="Mobile">
            <Container className="flex flex-col gap-1 py-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.id}
                  href={`${linkBase}#${link.id}`}
                  onClick={() => setOpen(false)}
                  aria-current={activeId === link.id ? "true" : undefined}
                  className={`border-b border-vls-border-alt py-3 text-[15px] ${
                    activeId === link.id ? "text-vls-red" : "text-vls-black"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {showCta && (
                <Link
                  href={`${linkBase}#register-form`}
                  onClick={() => setOpen(false)}
                  className="mt-4 flex h-12 items-center justify-center bg-vls-black text-[14px] font-bold text-vls-white"
                >
                  {course.ctaLabel}
                </Link>
              )}
            </Container>
          </nav>
        </div>
      </div>
    </header>
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Compact conversion content for the desktop header. Reuses the page's shared clock and target — no timer of its own. */
function ConversionLayer({ active, linkBase }: { active: boolean; linkBase: string }) {
  const course = useCourse();
  const now = useNow(course.nowMs);
  const { days, hours, minutes } = breakdown(course.startsAtMs, now);
  return (
    <div
      inert={!active}
      aria-hidden={!active}
      className={`col-start-1 row-start-1 flex items-center justify-between gap-5 transition-[opacity,translate] motion-reduce:transition-none ${
        active ? "translate-y-0 opacity-100 duration-200 ease-out" : "pointer-events-none translate-y-1.5 opacity-0 duration-200 ease-in"
      }`}
    >
      <Link href={`${linkBase}#top`} className="flex shrink-0 items-center" aria-label="VLS Law Academy — back to top">
        <Image src="/assets/vls/brand/vls-logo.png" alt="" width={56} height={56} />
      </Link>
      <p className="hidden shrink-0 text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-red min-[1100px]:block">{course.name}</p>
      <p className="shrink-0 text-[12px] font-bold uppercase tracking-[1.2px] text-vls-black">
        <span className="min-[1100px]:hidden">{course.headerDate}</span>
        <span className="hidden min-[1100px]:inline">{course.headerDateFull}</span>
      </p>
      <p className="shrink-0 text-[12px] font-bold uppercase tracking-[1.2px] tabular-nums text-vls-black">
        <span className="font-semibold text-vls-muted">Starts in </span>
        {pad(days)}D {pad(hours)}H<span className="hidden min-[1100px]:inline"> {pad(minutes)}M</span>
      </p>
      <p className="shrink-0 font-serif text-[22px] font-medium leading-none text-vls-black">{course.feeText}</p>
      <a
        href="#register-form"
        onClick={(event) => {
          noteStickyCta("sticky_desktop");
          scrollToRegistration(event);
        }}
        className="flex h-11 shrink-0 items-center justify-center bg-vls-red px-6 text-[13px] font-bold text-vls-white transition-colors duration-150 ease-out hover:bg-vls-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vls-black"
      >
        {course.ctaLabel}
      </a>
    </div>
  );
}
