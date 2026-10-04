export type CtaSource = "hero" | "sticky_desktop" | "sticky_mobile" | "final_cta";

// Last persistent-CTA the visitor used; the registration form reports it with the order.
let lastSticky: CtaSource | null = null;

export function noteStickyCta(source: CtaSource) {
  lastSticky = source;
}

/** Source of the registration: a sticky CTA click wins, otherwise the form the visitor actually used. */
export function resolveCtaSource(formId: string): CtaSource {
  return lastSticky ?? (formId === "hero" ? "hero" : "final_cta");
}
