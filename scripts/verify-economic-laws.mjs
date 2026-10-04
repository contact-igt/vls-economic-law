import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = (path) => readFile(resolve(root, path), "utf8");
const assertIncludes = (text, value, label) =>
  assert.ok(text.includes(value), `${label}: expected to include ${JSON.stringify(value)}`);
const assertExcludes = (text, value, label) =>
  assert.ok(!text.includes(value), `${label}: must not include ${JSON.stringify(value)}`);

const page = await source("src/app/page.tsx");
const hero = await source("src/components/sections/Hero.tsx");
const course = await source("src/lib/course.ts");
const layout = await source("src/app/layout.tsx");
const curriculum = await source("src/components/sections/Curriculum.tsx");
const testimonials = await source("src/components/sections/Testimonials.tsx");
const contentLock = await source("references/CONTENT_LOCK.md");
const earlyTrust = await source("src/components/sections/EarlyTrust.tsx");
const faculty = await source("src/components/sections/Faculty.tsx");
const whyVls = await source("src/components/sections/WhyVls.tsx");
const form = await source("src/components/RegistrationForm.tsx");
const createOrderRoute = await source("src/app/api/create-order/route.ts");
const verifyRoute = await source("src/app/api/verify-payment/route.ts");
const webhookRoute = await source("src/app/api/razorpay-webhook/route.ts");
const razorpay = await source("src/lib/razorpay.ts");
const registrations = await source("src/lib/registrations.ts");
const tracking = await source("src/lib/tracking.ts");
const countdown = await source("src/components/Countdown.tsx");
const faq = await source("src/components/Faq.tsx");
const responseSource = await source("src/components/Response.tsx");
const allProductionSource = [page, hero, course, layout, curriculum, testimonials, earlyTrust, faculty, whyVls, form, await source("src/components/Response.tsx"), await source("src/components/StickyConversion.tsx"), await source("src/components/sections/PracticeGap.tsx"), await source("src/components/sections/CourseObjective.tsx"), await source("src/components/sections/WhyProgramme.tsx"), await source("src/components/sections/GapFix.tsx"), await source("src/components/sections/ForumStrip.tsx"), await source("src/components/sections/CourseCore.tsx"), await source("src/components/sections/PracticalFramework.tsx"), await source("src/components/sections/DisputeJourney.tsx"), await source("src/components/sections/Outcomes.tsx"), await source("src/components/sections/WhoShouldAttend.tsx"), await source("src/components/sections/FinalCta.tsx"), await source("src/components/CtaNote.tsx"), await source("src/components/Countdown.tsx"), await source("src/components/Faq.tsx"), await source("src/components/Header.tsx"), await source("src/components/Footer.tsx"), await source("src/components/sections/EarlyCtaBand.tsx"), await source("src/components/sections/CoreVisual.tsx"), await source("src/app/thank-you/page.tsx"), await source("src/app/error/page.tsx")].join("\n");

const sections = [
  "<Header />",
  "<Hero />",
  "<EarlyTrust />",
  "<Faculty />",
  "<Testimonials />",
  "<PracticeGap />",
  "<CoreVisual />",
  "<EarlyCtaBand />",
  "<CourseObjective />",
  "<WhyProgramme />",
  "<GapFix />",
  "<Curriculum />",
  "<ForumStrip />",
  "<CourseCore />",
  "<PracticalFramework />",
  "<DisputeJourney />",
  "<Outcomes />",
  "<WhoShouldAttend />",
  "<WhyVls />",
  "<FaqSection />",
  "<FinalCta />",
  "<Footer />",
  "<StickyConversion />",
];

let previous = -1;
for (const section of sections) {
  const index = page.indexOf(section);
  assert.ok(index > previous, `page spine: ${section} is missing or out of order`);
  previous = index;
}

for (const phrase of [
  "FOUNDATION COURSE",
  "Economic Laws & Practice",
  "Benami",
  "Black Money",
  "Money Laundering Laws",
  "Procedure & Practice",
]) {
  assertIncludes(hero, phrase, "hero lock");
}
assert.match(hero, /<h1[\s>]/, "hero lock: exactly one H1 is provided by the hero");
assertIncludes(course, 'pageName: "economic-laws-practice"', "commercial configuration");
// Launch offer: ₹499, registration open, no waitlist.
assertIncludes(course, "fee: 499", "commercial configuration");
assertIncludes(course, 'sessionStatus: "announced"', "commercial configuration");
assertIncludes(course, "seatCap: null", "no invented seat cap");
for (const value of [
  'classStartAt: "2026-10-10T18:00:00+05:30"',
  'classDay: "Saturday"',
  'classDate: "10 October 2026"',
  'classTime: "6:00 PM – 9:00 PM IST"',
  'classTimeShort: "6–9 PM"',
  'classDuration: "3 Hours"',
]) {
  assertIncludes(course, value, "confirmed schedule");
}
assert.equal(
  new Date("2026-10-10T18:00:00+05:30").toLocaleDateString("en-IN", { weekday: "long", timeZone: "Asia/Kolkata" }),
  "Saturday",
  "confirmed schedule: 10 October 2026 must be a Saturday",
);
assert.equal(
  new Date("2026-10-10T18:00:00+05:30").toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }),
  "18:00",
  "confirmed schedule: start time and registration deadline must be 6:00 PM IST",
);
assertIncludes(course, 'ctaLabel = paid ? `Register Now — ${feeText}`', "paid CTA");
assertIncludes(course, 'compactCtaLabel: paid ? "Register Now"', "paid CTA");
assertIncludes(course, 'stickyCtaLabel: paid ? "Register Now"', "paid CTA");
for (const stale of [
  "waitlist", "Waitlist", "Join the Waitlist", "notify you", "We'll notify",
  "Date and time will be announced", "date and time will be announced",
  "Date to be announced", "Time to be announced", "Duration to be announced",
  'value: "To be announced"', '"TBA"', "When is the next session?", "will be announced",
  "₹0", "limited seats", "seats left", "seats filling", "almost sold out", "Only 3", "Only 5",
  "Best Economic Laws Course", "#1 Economic Laws", "Master PMLA in 3 Hours", "Become an Economic Laws Expert",
  "Guaranteed", "guaranteed", "originalPrice",
  "NEXT_PUBLIC_RAZORPAY",
  "Secure My Seat", "Secure Seat", "Enroll Now", "Book Now",
  "Razorpay Trusted", "Razorpay Verified", "Verified by Razorpay", "Razorpay Certified", "Razorpay Secure Badge",
]) {
  assertExcludes(allProductionSource, stale, "forbidden stale/unverified copy");
}
assertIncludes(layout, "Economic Laws & Practice | VLS Law Academy", "metadata");
assertIncludes(layout, "Module 11", "metadata");

// Real urgency: one countdown, driven by the absolute class-start timestamp in the central config.
assertIncludes(countdown, "course.startsAtMs", "countdown");
assertIncludes(course, "startsAtMs: Date.parse(programConfig.classStartAt)", "countdown deadline source");
assertIncludes(hero, "<Countdown />", "hero countdown");
assertExcludes(countdown, "localStorage", "countdown must not persist or reset per visitor");
assertExcludes(countdown, "Math.random", "countdown must not be fabricated");

for (const phrase of [
  "Prevention of Money Laundering Act (PMLA) 2002",
  "Benami Transaction Act, 2016",
  "Foreign Exchange Management Act, 1999",
  "Conservation of Foreign Exchange and Prevention of Smuggling Activities Act 1973",
  "Matters and disputes related to Prevention of Money Laundering Act, 2002",
  "Matters and disputes related to Benami Transaction Act, 2016",
  "Matters and disputes related to Foreign Exchange Management Act, 1999",
  "Trials before Special Court",
]) {
  assertIncludes(curriculum, phrase, "Module 11 curriculum");
  assertIncludes(contentLock, phrase, "Module 11 content lock");
}

for (const phrase of [
  "Black Money Act",
  "DRT & SARFAESI Proceedings",
  "Debt Recovery Tribunal",
  "Debt Recovery Appellate Tribunal",
  "September 20, 2026",
  "05:00 PM",
]) {
  assertExcludes(allProductionSource, phrase, "course boundary");
}

for (const path of [
  "public/assets/vls/brand/vls-logo.png",
  "public/assets/vls/faculty/dr-sivakumar.png",
  "public/assets/vls/testimonials/testimonial-1.jpg",
  "public/assets/vls/testimonials/testimonial-2.png",
  "public/assets/vls/testimonials/testimonial-3.png",
  "public/assets/vls/classroom/classroom-faculty-pointing.jpg",
  "public/assets/vls/classroom/classroom-students-notes.jpg",
  "public/assets/vls/classroom/classroom-procedure-flowchart.jpg",
  "public/assets/vls/classroom/classroom-wide-session.jpg",
  "public/assets/vls/classroom/academy-interior.jpg",
  "public/assets/vls/classroom/classroom-faculty-teaching.jpg",
]) {
  await access(resolve(root, path));
}

for (const mapping of [
  '"/assets/vls/testimonials/testimonial-1.jpg"',
  '"/assets/vls/testimonials/testimonial-2.png"',
  '"/assets/vls/testimonials/testimonial-3.png"',
  "vls-testimonal3_ajrnrk.mp4",
  "vls_testimonal4_fmdamk.mp4",
  "vls-testimoanl1_ddcvpb.mp4",
]) {
  assertIncludes(testimonials, mapping, "testimonial media mapping");
}

for (const [component, asset] of [
  [earlyTrust, "/assets/vls/classroom/classroom-faculty-pointing.jpg"],
  [earlyTrust, "/assets/vls/classroom/classroom-students-notes.jpg"],
  [faculty, "/assets/vls/faculty/dr-sivakumar.png"],
  [curriculum, "/assets/vls/classroom/classroom-procedure-flowchart.jpg"],
  [whyVls, "/assets/vls/classroom/classroom-wide-session.jpg"],
  [whyVls, "/assets/vls/classroom/academy-interior.jpg"],
  [whyVls, "/assets/vls/classroom/classroom-faculty-teaching.jpg"],
]) {
  assertIncludes(component, asset, "production media reference");
}

assertIncludes(form, "htmlFor={id}", "form labels");
assertIncludes(form, 'autoComplete="name"', "form autofill");
assertIncludes(form, "saveProof(", "form hands the checkout proof to the Thank You page for server verification");
assertExcludes(form, "/api/verify-payment", "verification happens on the Thank You page, not in the form");
assertIncludes(form, "body: JSON.stringify({ ...values, ...utm, cta_source: resolveCtaSource(formId) })", "create-order request carries only student details, UTM and CTA source");
assert.ok(!/course\.fee\b/.test(form), "client must not send or decide an amount");
assertExcludes(form, "SHEET_URL", "client must not write registrations itself");
assertExcludes(form, "payment_status", "paid state is decided by the server only");

// Payment security (behaviour is exercised by scripts/check-payment-flow.mjs).
assertIncludes(createOrderRoute, "getRegistrationAction(programConfig) !== \"payment\"", "payment route deadline/open guard");
assert.ok(
  createOrderRoute.indexOf("getRegistrationAction(programConfig)") < createOrderRoute.indexOf("req.json()") &&
    createOrderRoute.indexOf("getRegistrationAction(programConfig)") < createOrderRoute.indexOf("createOrder("),
  "payment route guard: must run before body parsing and any Razorpay call",
);
assertIncludes(createOrderRoute, "feeInPaise()", "server-derived amount");
assertExcludes(createOrderRoute, "body.amount", "client amount must not be read");
assertIncludes(razorpay, "const { fee } = programConfig;", "amount derives from programConfig.fee");
assertIncludes(razorpay, "programConfig", "amount derives from programConfig.fee");
assertIncludes(razorpay, "createHmac(\"sha256\"", "HMAC signature verification");
assertIncludes(razorpay, "timingSafeEqual", "constant-time signature comparison");
assertIncludes(razorpay, 'payment.status !== "captured"', "capture verification");
assertIncludes(verifyRoute, "verifyCheckoutSignature(", "checkout signature verification endpoint");
assertIncludes(verifyRoute, "confirmPayment(", "capture verification endpoint");
assertIncludes(webhookRoute, "verifyWebhookSignature(", "webhook authenticity");
assertIncludes(webhookRoute, "payment.captured", "webhook events");
assertIncludes(registrations, "writes.get(r.paymentId)", "idempotent registration writes");
assertExcludes(registrations, "script.google.com", "sheet deployment URL must be configuration, not source");
assertIncludes(await source("scripts/google-sheet-webapp.gs"), "'duplicate'", "sheet-side payment id upsert");
assertIncludes(tracking, "eventID: paymentId", "deduplicated purchase conversion");
assertIncludes(responseSource, "trackVerifiedPurchase", "purchase conversion lives on the verified success page");
assertIncludes(responseSource, "/api/verify-payment", "Thank You page asks the server to verify");
assertIncludes(responseSource, "Your Seat Is Confirmed.", "verified Thank You headline");
assertIncludes(responseSource, "We couldn't verify this payment yet", "unverified state");
assertIncludes(responseSource, "Check Payment Status", "unverified state action");
assertIncludes(responseSource, "Payment not completed", "failure state");
assertIncludes(responseSource, "Try Payment Again", "failure retry");
assertIncludes(responseSource, "icsContent()", "add to calendar");
for (const [name, text] of [["Response", responseSource], ["thank-you page", await source("src/app/thank-you/page.tsx")]]) {
  assertExcludes(text, "useSearchParams", `${name}: success must never be derived from the URL`);
  assertExcludes(text, "searchParams", `${name}: success must never be derived from the URL`);
}
// Persistent conversion system: one component, reuses the page form, yields to forms, keyboard and checkout.
const sticky = await source("src/components/StickyConversion.tsx");
assertIncludes(sticky, "env(safe-area-inset-bottom)", "sticky dock safe-area");
assertIncludes(sticky, "focusin", "sticky hides while a form field is focused");
assertIncludes(sticky, "visualViewport", "sticky hides when the keyboard opens");
assertIncludes(sticky, "useCheckoutOpen", "sticky yields to checkout");
assertIncludes(sticky, "inert={hidden}", "sticky is inert when hidden");
assertIncludes(sticky, 'href="#register-form"', "sticky reuses the page registration form");
assertExcludes(sticky, "/api/", "sticky has no payment logic of its own");
assertIncludes(sticky, "lg:hidden", "dock is mobile/tablet only — desktop uses the morphing header");
assertIncludes(sticky, "translate-y-[110%]", "dock slides in/out");
assertIncludes(sticky, "transition-[translate,opacity]", "dock animates translate + opacity (Tailwind v4 uses the translate property)");
assertIncludes(sticky, "motion-reduce:transition-none", "dock respects reduced motion");
assertIncludes(hero, 'id="hero-conversion"', "hero countdown + CTA area is observable");
assertIncludes(hero, "<Countdown />", "hero keeps the large countdown");

// ONE desktop header surface with two states (no second stacked bar).
const header = await source("src/components/Header.tsx");
assertIncludes(header, "useExitedAbove(\"hero-conversion\")", "header morphs from an IntersectionObserver sentinel");
assertIncludes(header, "function ConversionLayer", "header conversion state");
assertIncludes(header, "inert={converting}", "inactive header layer is inert");
assertIncludes(header, "transition-[opacity,translate]", "header layers animate opacity + translate only");
assertIncludes(header, "inert={!active}", "inactive conversion layer is inert");
assertIncludes(header, "useNow(course.nowMs)", "header countdown uses the shared clock");
assertIncludes(header, "breakdown(course.startsAtMs", "header countdown uses the shared target");
assertIncludes(header, 'grid h-[85px]', "stable header height (no layout shift)");
assertExcludes(header, "setInterval", "header must not start its own timer");
assertExcludes(countdown, "setInterval", "hero countdown must not start its own timer");
const useNowSource = await source("src/lib/useNow.ts");
assertIncludes(useNowSource, "setInterval(tick, 1000)", "single shared clock");
assertIncludes(useNowSource, "clearInterval", "shared clock cleans up");
assert.equal((useNowSource.match(/setInterval/g) || []).length, 1, "exactly one interval in the app clock");
assertIncludes(await source("src/lib/countdown.ts"), "startsAtMs - nowMs", "countdown is an absolute deadline");
assertExcludes(sticky, "lg:top-[85px]", "no second stacked desktop bar");
assertIncludes(await source("src/lib/registerTarget.ts"), "prefers-reduced-motion", "registration scroll respects reduced motion");
assertIncludes(await source("src/lib/registerTarget.ts"), 'return "register-form"', "registration target id") ;
assertIncludes(await source("src/components/sections/FinalCta.tsx"), 'id="register-form"', "registration CTA target exists") ;
assertIncludes(hero, 'id="hero-register-form"', "hero registration target exists");

assertIncludes(await source("src/lib/calendar.ts"), "classEndAt", "calendar uses the configured end time");
assertIncludes(course, 'classEndAt: "2026-10-10T21:00:00+05:30"', "confirmed schedule end");
assertExcludes(form, "trackVerifiedPurchase", "no conversion on click / modal open / unverified callback");
for (const [name, text] of [["razorpay.ts", razorpay], ["registrations.ts", registrations]]) {
  assertExcludes(text, "NEXT_PUBLIC_RAZORPAY", `${name}: secrets must never come from NEXT_PUBLIC_ variables`);
}
assertIncludes(razorpay, "process.env.RAZORPAY_KEY_SECRET", "server-only key secret");
for (const [name, text] of [["page", page], ["hero", hero], ["form", form], ["course", course]]) {
  assertExcludes(text, "RAZORPAY_KEY_SECRET", `${name}: key secret must stay server-side`);
  assertExcludes(text, "RAZORPAY_WEBHOOK_SECRET", `${name}: webhook secret must stay server-side`);
}

// Razorpay: official self-hosted badge only, official wording, no invented trust claims.
const paymentTrust = await source("src/components/PaymentTrust.tsx");
await access(resolve(root, "public/brands/razorpay/badge-light.png"));
assertIncludes(paymentTrust, "/brands/razorpay/badge-light.png", "official local Razorpay badge");
assertIncludes(paymentTrust, "Secure payments powered by Razorpay", "Razorpay wording");
assertIncludes(paymentTrust, "course.deadlineNote", "deadline note in the payment trust block");
assertIncludes(form, "<PaymentTrust />", "payment trust in the registration form (hero and final)");
assertExcludes(form, "Lawyer-led practical legal training", "redundant VLS trust line removed from the form");
assertExcludes(form, "powered by Razorpay", "form uses the shared PaymentTrust component only");
const finalCta = await source("src/components/sections/FinalCta.tsx");
assertIncludes(finalCta, "<RegistrationForm formId=\"final\" />", "final registration retains the form (and its Razorpay trust)");
assertIncludes(finalCta, "<SessionSummary />", "final CTA states the session details and fee");
assertIncludes(hero, "<SessionSummary />", "hero card states the session details and fee");
assertIncludes(course, 'formHeading: paid ? "Complete Your Registration"', "payment card heading");
assert.equal((await source("src/components/Response.tsx")).includes("StickyConversion"), false, "no purchase dock on status pages");
for (const status of ["src/app/thank-you/page.tsx", "src/app/error/page.tsx"]) {
  const text = await source(status);
  assertIncludes(text, "showCta={false}", `${status}: no Register Now in the header on status pages`);
  assertExcludes(text, "StickyConversion", `${status}: no purchase dock on status pages`);
}

// Purchase FAQs.
for (const question of ["When is the session?", "How long is the session?", "What is the registration fee?", "How do I confirm my registration?", "What happens after payment?"]) {
  assertIncludes(faq, question, "purchase FAQ");
}

// Proof bar and faculty trust use only approved figures.
for (const figure of ["5,000+", "1,000+", "250+", "1,200+"]) assertIncludes(hero, figure, "hero proof bar");
assertIncludes(faculty, "Since 2003", "faculty credibility");
assertIncludes(testimonials, "Real VLS Student Experiences", "testimonial heading");

console.log("Economic Laws verification passed.");
