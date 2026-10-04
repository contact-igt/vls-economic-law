"use client";

import { useCourse } from "@/components/CourseProvider";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Container } from "./ui/Container";
import { HeaderCta } from "./ui/Button";
import { useActiveSection } from "@/lib/useActiveSection";

const NAV_LINKS = [
  { id: "why-this-course", label: "Why this course" },
  { id: "curriculum", label: "Curriculum" },
  { id: "faculty", label: "Faculty" },
  { id: "faqs", label: "FAQs" },
];

const NAV_IDS = NAV_LINKS.map((l) => l.id);

export function Header({ linkBase = "" }: { linkBase?: string }) {
  const course = useCourse();
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
      <Container className="flex h-[85px] items-center justify-between">
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

        <div className="hidden md:block">
          <HeaderCta href={`${linkBase}#register-form`}>{course.ctaLabel}</HeaderCta>
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
              <Link
                href={`${linkBase}#register-form`}
                onClick={() => setOpen(false)}
                className="mt-4 flex h-12 items-center justify-center bg-vls-black text-[14px] font-bold text-vls-white"
              >
                {course.ctaLabel}
              </Link>
            </Container>
          </nav>
        </div>
      </div>
    </header>
  );
}
