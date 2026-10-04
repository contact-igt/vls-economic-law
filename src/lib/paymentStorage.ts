/**
 * Proof of a Checkout attempt kept in the browser: the three values Razorpay returns. They carry no
 * personal data and cannot be forged without the server-held key secret. The Thank You page sends them
 * to /api/verify-payment and shows "confirmed" only if the SERVER verifies them.
 */
export type PaymentProof = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

const PROOF_KEY = "PaymentProof";
const DRAFT_KEY = "RegistrationDraft";
const WAITLIST_KEY = "WaitlistConfirmation";

export type RegistrationDraft = { name: string; email: string; mobile: string };

function read<T>(storage: "localStorage" | "sessionStorage", key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window[storage].getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: "localStorage" | "sessionStorage", key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window[storage].removeItem(key);
    else window[storage].setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — the flow still works, only refresh-recovery is lost */
  }
}

// A newer payment attempt supersedes any earlier waitlist confirmation shown on the Thank You page.
export const saveProof = (proof: PaymentProof) => {
  write("localStorage", PROOF_KEY, proof);
  write("sessionStorage", WAITLIST_KEY, null);
};
export const readProof = () => read<PaymentProof>("localStorage", PROOF_KEY);

// Entered details survive a failed payment so the visitor does not retype them.
export const saveDraft = (draft: RegistrationDraft) => write("sessionStorage", DRAFT_KEY, draft);
export const readDraft = () => read<RegistrationDraft>("sessionStorage", DRAFT_KEY);
export const clearDraft = () => write("sessionStorage", DRAFT_KEY, null);

/** Waitlist join accepted by /api/waitlist (no payment). Only drives the waitlist Thank You copy — never "paid". */
export type WaitlistConfirmation = { name: string; courseName: string };
export const saveWaitlist = (confirmation: WaitlistConfirmation) => write("sessionStorage", WAITLIST_KEY, confirmation);
export const readWaitlist = () => read<WaitlistConfirmation>("sessionStorage", WAITLIST_KEY);
