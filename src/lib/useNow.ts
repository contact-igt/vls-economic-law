"use client";

import { useSyncExternalStore } from "react";

// ONE shared 1-second clock for every countdown on the page. The interval runs only while something is
// subscribed and is cleared with the last subscriber, so header, hero and dock never start their own timers.
let now = 0;
let timer: number | undefined;
const listeners = new Set<() => void>();

function tick() {
  now = Date.now();
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) {
    tick();
    timer = window.setInterval(tick, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

/** `serverNow` (the server-rendered clock) keeps hydration identical, then the shared clock takes over. */
export function useNow(serverNow: number) {
  return useSyncExternalStore(subscribe, () => now || serverNow, () => serverNow);
}
