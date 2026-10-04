/**
 * ONE behaviour for every "Register Now" action: scroll to the hero form while it is still on screen or ahead,
 * otherwise to the final form. Both are the same RegistrationForm; there is no third form.
 */
export function pickRegistrationId() {
  const hero = document.getElementById("hero-register-form");
  if (!hero) return "register-form";
  const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  return window.scrollY < heroBottom - 100 ? "hero-register-form" : "register-form";
}

export function scrollToElementId(event: { preventDefault: () => void }, id: string) {
  const target = document.getElementById(id);
  if (!target) return false;
  event.preventDefault();
  history.replaceState(null, "", `#${id}`);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // scroll-margin-top on [id] (globals.css) keeps the target clear of the sticky header.
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  return true;
}

export function scrollToRegistration(event: { preventDefault: () => void }) {
  return scrollToElementId(event, pickRegistrationId());
}
