"use client";

import { useEffect, useState } from "react";
import { useHiddenNear } from "@/lib/useHiddenNear";
import { useCourse } from "@/components/CourseProvider";
import { useCheckoutOpen } from "@/lib/checkoutState";
import { noteStickyCta } from "@/lib/ctaSource";

// The sticky UI yields to the hero conversion area (CTA + form), the final form and the footer.
const WATCH_IDS = ["hero-cta", "hero-register-form", "register-form", "site-footer"];

/** True while a registration field has focus or the on-screen keyboard has shrunk the viewport. */
function useEditing() {
  const [focused, setFocused] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  useEffect(() => {
    const onIn = (e: FocusEvent) => setFocused(e.target instanceof HTMLElement && Boolean(e.target.closest("form")));
    const onOut = () => setFocused(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    const vv = window.visualViewport;
    const onResize = () => vv && setKeyboard(window.innerHeight - vv.height > 150);
    vv?.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
      vv?.removeEventListener("resize", onResize);
    };
  }, []);
  return focused || keyboard;
}

/**
 * One persistent paid-registration CTA. ≥1024px: slim bar under the site header. Below that: bottom dock
 * with safe-area padding. It reuses the page's registration form (scrolls to it); it has no payment logic.
 */
export function StickyConversion() {
  const course = useCourse();
  const nearTarget = useHiddenNear(WATCH_IDS);
  const editing = useEditing();
  const checkoutOpen = useCheckoutOpen();
  if (!course.isPaid) return null;
  const hidden = nearTarget || editing || checkoutOpen;

  return (
    <div
      aria-hidden={hidden}
      inert={hidden}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-vls-border bg-white/98 shadow-[0_-4px_16px_rgba(17,19,21,0.08)] backdrop-blur-sm transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none lg:bottom-auto lg:top-[85px] lg:border-b lg:border-t-0 lg:shadow-[0_4px_16px_rgba(17,19,21,0.06)] ${
        hidden ? "pointer-events-none translate-y-full opacity-0 lg:-translate-y-full" : "translate-y-0 opacity-100"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Tablet / mobile dock */}
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-5 py-2.5 [@media(max-height:480px)]:py-1 lg:hidden">
        <div className="min-w-0 leading-tight">
          <p className="text-[14px] font-extrabold uppercase tracking-[0.6px] text-vls-black">{course.stickyDate}</p>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[1px] text-vls-red">{course.stickyMeta}</p>
        </div>
        <a
          href="#register-form"
          onClick={() => noteStickyCta("sticky_mobile")}
          className="flex h-[54px] min-w-[140px] [@media(max-height:480px)]:h-12 shrink-0 items-center justify-center bg-vls-red px-6 text-[14px] font-bold uppercase tracking-[0.6px] text-vls-white transition-colors duration-150 ease-out hover:bg-vls-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vls-black"
        >
          {course.stickyCtaLabel}
        </a>
      </div>

      {/* Desktop bar */}
      <div className="mx-auto hidden h-16 max-w-[1180px] items-center justify-between gap-6 px-10 lg:flex">
        <p className="shrink-0 text-[11px] font-extrabold uppercase tracking-[1.6px] text-vls-red">{course.name}</p>
        <p className="min-w-0 truncate text-[12px] font-bold uppercase tracking-[1.2px] text-vls-black">{course.stickyDesktop}</p>
        <p className="shrink-0 font-serif text-[22px] font-medium text-vls-black">{course.feeText}</p>
        <a
          href="#register-form"
          onClick={() => noteStickyCta("sticky_desktop")}
          className="flex h-11 shrink-0 items-center justify-center bg-vls-red px-6 text-[13px] font-bold text-vls-white transition-colors duration-150 ease-out hover:bg-vls-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vls-black"
        >
          {course.ctaLabel}
        </a>
      </div>
    </div>
  );
}
