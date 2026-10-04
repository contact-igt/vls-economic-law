"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

/**
 * Fade-and-rise on scroll into view.
 *
 * Content renders visible by default. Only after mount, once the client has
 * confirmed the element currently sits below the fold, does it get hidden and
 * then revealed as it scrolls in. Above-the-fold content is never hidden, and a
 * no-JS / failed-hydration visitor always sees the full page. The animation runs
 * once, then the observer disconnects. `prefers-reduced-motion` is honoured in
 * CSS.
 */
export function Reveal({
  children,
  className = "",
  delayMs = 0,
  id,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"idle" | "hidden" | "shown">("idle");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const alreadyInView = rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
    if (alreadyInView) {
      setState("shown");
      return;
    }

    setState("hidden");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting || entry.boundingClientRect.bottom < 0) {
          setState("shown");
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      data-reveal={state === "hidden" ? "hidden" : undefined}
      className={`reveal ${className}`}
      style={{ transitionDelay: state === "shown" ? `${delayMs}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
