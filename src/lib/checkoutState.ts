"use client";

import { useSyncExternalStore } from "react";

// Whether a payment is in progress (order being created, Razorpay open, or verifying).
// The persistent CTA reads this so it never competes with or covers the payment flow.
let open = false;
const listeners = new Set<() => void>();

export function setCheckoutOpen(next: boolean) {
  if (open === next) return;
  open = next;
  listeners.forEach((listener) => listener());
}

export function useCheckoutOpen() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => open,
    () => false,
  );
}
