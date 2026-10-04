import { getRegistrationAction, getSeatsRemaining, isRegistrationOpen } from "./programStatus";

export const programConfig = {
  sessionStatus: "announced",
  classStartAt: "2026-10-10T18:00:00+05:30",
  classEndAt: "2026-10-10T21:00:00+05:30",
  classDay: "Saturday",
  classDate: "10 October 2026",
  classDateShort: "10 Oct",
  classTime: "6:00 PM – 9:00 PM IST",
  classTimeShort: "6–9 PM",
  classDuration: "3 Hours",
  pageName: "economic-laws-practice",
  courseName: "Economic Laws & Practice",
  phone: "+919500207811",
  fee: 499 as number | null,
  seatCap: null as number | null,
};

export type ProgramConfig = typeof programConfig;
export const isPaidMode = (config: ProgramConfig, now: number) => getRegistrationAction(config, now) === "payment";

export function getCourse(now: number, verifiedPaid: number | null = null) {
  const open = isRegistrationOpen(programConfig, now);
  const paid = isPaidMode(programConfig, now);
  const { classDate: date, classTime: time, classDuration: duration } = programConfig;
  const fullDate = `${programConfig.classDay}, ${date}`;
  const feeText = paid ? `₹${programConfig.fee}` : null;
  const seatsRemaining = getSeatsRemaining(programConfig.seatCap, verifiedPaid);
  const ctaLabel = paid ? `Register Now — ${feeText}` : "Registration Closed";
  return {
    name: programConfig.courseName, subtitle: "Procedure & Practice", date, time, duration, fullDate,
    fee: programConfig.fee, feeText, phone: programConfig.phone,
    phoneDisplay: `${programConfig.phone.slice(0, 3)} ${programConfig.phone.slice(3, 8)} ${programConfig.phone.slice(8)}`,
    startsAtMs: Date.parse(programConfig.classStartAt), nowMs: now,
    registrationMode: paid ? "PAID" : "CLOSED", isPaid: paid, isOpen: open,
    seatsLabel: seatsRemaining === null ? null : `${seatsRemaining} seats remaining`,
    ctaLabel, ctaLabelWithFee: ctaLabel, compactCtaLabel: paid ? "Register Now" : "Registration Closed",
    stickyCtaLabel: paid ? "Register Now" : "Closed",
    stickyDate: `${programConfig.classDateShort} · ${programConfig.classTimeShort}`.toUpperCase(),
    stickyMeta: `${duration} · ${feeText ?? "Closed"}`.toUpperCase(),
    formHeading: paid ? "Complete Your Registration" : "Registration Closed", formSubmitLabel: ctaLabel,
    eyebrow: paid ? "Registration Open" : "Registration Closed",
    secondaryCtaLabel: "Explore the Curriculum ↓",
    sessionHeading: `${programConfig.classDay} · ${date}`,
    headerDate: `${programConfig.classDateShort} · ${programConfig.classDay.slice(0, 3)}`.toUpperCase(),
    headerDateFull: `${programConfig.classDateShort} · ${programConfig.classDay.slice(0, 3)} · ${programConfig.classTimeShort} IST`.toUpperCase(),
    bandBlurb: `Live on ${fullDate} · ${time} · ${feeText ?? "Registration closed"}`,
    deadlineNote: "Registration closes when the live session begins.",
    faqSessionAnswer: `${fullDate}, from 6:00 PM to 9:00 PM IST.`,
    faqDurationAnswer: "3 hours.",
    faqFeeAnswer: paid ? `${feeText}.` : "Registration is closed.",
    faqConfirmAnswer: "Your seat is confirmed after successful verified payment through the registration page.",
    faqAfterPaymentAnswer: "Once your payment is verified, your registration is recorded for the Economic Laws & Practice session and a confirmation with your payment reference is shown on screen. VLS will send the session access details through your registered contact information.",
    heroMetaCards: [
      { label: "Class Date", value: fullDate }, { label: "Class Time", value: time },
      { label: "Duration", value: duration }, { label: "Registration Fee", value: feeText ?? "Closed" },
    ],
  };
}
