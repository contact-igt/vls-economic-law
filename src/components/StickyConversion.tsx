"use client";

import { useEffect, useState } from "react";
import { useHiddenNear } from "@/lib/useHiddenNear";
import { useCourse } from "@/components/CourseProvider";
import { useCheckoutOpen } from "@/lib/checkoutState";
import { noteStickyCta } from "@/lib/ctaSource";
import { scrollToRegistration } from "@/lib/registerTarget";

// The dock yields to the hero conversion area (countdown + CTA + form), the final form and the footer.
const WATCH_IDS = ["hero-conversion", "hero-register-form", "register-form", "site-footer"];

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
 * Mobile / tablet (<1024px) bottom conversion dock, with safe-area padding. Desktop uses the morphing header
 * instead, so this renders nothing visible there. It has no payment logic: it scrolls to the page's form.
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
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-vls-border bg-white/98 shadow-[0_-4px_16px_rgba(17,19,21,0.08)] backdrop-blur-sm transition-[translate,opacity] duration-[220ms] ease-out motion-reduce:transition-none lg:hidden ${
        hidden ? "pointer-events-none translate-y-[110%] opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-5 py-2.5 [@media(max-height:480px)]:py-1">
        <div className="min-w-0 leading-tight">
          <p className="text-[14px] font-extrabold uppercase tracking-[0.6px] text-vls-black">{course.stickyDate}</p>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[1px] text-vls-red">{course.stickyMeta}</p>
        </div>
        <a
          href="#register-form"
          onClick={(event) => {
            noteStickyCta("sticky_mobile");
            scrollToRegistration(event);
          }}
          className="flex h-[54px] min-w-[140px] shrink-0 items-center justify-center bg-vls-red px-6 text-[14px] font-bold uppercase tracking-[0.6px] text-vls-white transition-colors duration-150 ease-out hover:bg-vls-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-vls-black [@media(max-height:480px)]:h-12"
        >
          {course.stickyCtaLabel}
        </a>
      </div>
    </div>
  );
}
