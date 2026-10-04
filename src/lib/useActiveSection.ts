"use client";

import { useEffect, useState } from "react";

/**
 * Returns the id of the section currently closest to the reading position.
 * Uses one IntersectionObserver over the given ids (a band around the viewport
 * centre) rather than a scroll handler. Cleans up on unmount.
 */
export function useActiveSection(ids: string[], fallback = ""): string {
  const [active, setActive] = useState<string>(fallback);

  useEffect(() => {
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
