export type ProgramConfig = { sessionStatus: string; classStartAt?: string; registrationEndsAt?: string };

/** The paid-registration deadline: `registrationEndsAt` when set, otherwise the class start. NaN when absent/invalid. */
export function registrationDeadline(config: ProgramConfig) {
  const value = config.registrationEndsAt || config.classStartAt;
  return value ? Date.parse(value) : NaN;
}

/**
 * The ONLY open/closed decision for the page and the API. Open only while the session is "announced", the
 * dates are valid and the registration deadline has not passed. Closed means the page collects waitlist leads.
 */
export function isRegistrationOpen(config: ProgramConfig, now = Date.now()) {
  const deadline = registrationDeadline(config);
  return config.sessionStatus === "announced" &&
    Number.isFinite(deadline) && Number.isFinite(Date.parse(config.classStartAt ?? "")) && now < deadline;
}

/** "payment" while paid registration is open and priced; otherwise visitors can only join the waitlist. */
export function getRegistrationAction(config: ProgramConfig & { fee: number | null }, now = Date.now()) {
  if (!isRegistrationOpen(config, now)) return "waitlist";
  return typeof config.fee === "number" && Number.isFinite(config.fee) && config.fee > 0
    ? "payment" : "waitlist";
}

/** Seats are only ever reported from a real cap and a verified paid count; otherwise no claim is made. */
export function getSeatsRemaining(seatCap: number | null, verifiedPaid: number | null) {
  if (seatCap === null || verifiedPaid === null) return null;
  return Math.max(0, seatCap - verifiedPaid);
}
