# CONTENT_LOCK — Economic Laws & Practice · Procedure & Practice

## Authority

The page follows the approved VLS landing-page template for component tree, page order, visual system, responsive behavior, forms, and media presentation.

## Hero lock

The hero must prominently preserve: **FOUNDATION COURSE**, **ECONOMIC LAWS & PRACTICE**, **BENAMI**, **BLACK MONEY**, **MONEY LAUNDERING LAWS**, and **PROCEDURE & PRACTICE**. "Black Money" is positioning only and must not become a syllabus Act, topic, or procedural claim.

## Programme scope — Module 11 only

Unit I:

- Prevention of Money Laundering Act (PMLA) 2002
- Benami Transaction Act, 2016
- Foreign Exchange Management Act, 1999
- Conservation of Foreign Exchange and Prevention of Smuggling Activities Act 1973

Unit II:

- Matters and disputes related to Prevention of Money Laundering Act, 2002
- Matters and disputes related to Benami Transaction Act, 2016
- Matters and disputes related to Foreign Exchange Management Act, 1999
- Trials before Special Court — Prevention of Money Laundering Cases

No material from Modules 1-10 or Module 12, external legal research, statutory procedure, or outcome claims may be added.

## Commercial state

Programme identifier: `economic-laws-practice`. Paid registration is **OPEN**: Saturday, 10 October 2026, 6:00 PM – 9:00 PM IST, 3 Hours, fee ₹499. Paid registration closes at `registrationEndsAt` (2026-10-10T18:00:00+05:30, the class start), decided only by `isRegistrationOpen` / `getRegistrationAction` in `src/lib/programStatus.ts` and enforced in the UI and in `/api/create-order`. After it every CTA reads **Join Waitlist**: no Razorpay order is created, and `/api/waitlist` records the lead to the same sheet/backend with `payment_status: "waitlist"`, `amount` 0 and empty payment fields. The order amount is derived server-side from `programConfig.fee`; the browser never supplies it. Seat scarcity may only be shown from a real `seatCap` and a verified paid count (`seatCap` is `null`). All mutable commercial copy remains in `src/lib/course.ts`.

## Media and institutional content

Keep the approved VLS media in its existing section, order, crop, and interaction pattern: both EarlyTrust images; Dr. Sivakumar Sivaprakasam's portrait and generic approved bio; three generic VLS testimonial cards with their existing video mapping and dialog behavior; the Curriculum image; and the three-image Why VLS collage.
