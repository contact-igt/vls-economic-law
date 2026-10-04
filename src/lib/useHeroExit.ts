"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

/** True once the element has scrolled out of view ABOVE the viewport. One IntersectionObserver, no scroll listener. */
export function useExitedAbove(id: string) {
  const [exited, setExited] = useState(false);
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      setExited(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [id]);
  return exited;
}

/** matchMedia as external store: false on the server and during hydration, then the real value. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
