export type ProgramConfig = { sessionStatus: string; classStartAt?: string };

/** Registration is open only while the status is "announced" and the class has not started. */
export function isRegistrationOpen(config: ProgramConfig, now = Date.now()) {
  return config.sessionStatus === "announced" &&
    Boolean(config.classStartAt) && now < Date.parse(config.classStartAt!);
}

export function getRegistrationAction(config: ProgramConfig & { fee: number | null }, now = Date.now()) {
  if (!isRegistrationOpen(config, now)) return "closed";
  return typeof config.fee === "number" && Number.isFinite(config.fee) && config.fee > 0
    ? "payment" : "unavailable";
}

/** Seats are only ever reported from a real cap and a verified paid count; otherwise no claim is made. */
export function getSeatsRemaining(seatCap: number | null, verifiedPaid: number | null) {
  if (seatCap === null || verifiedPaid === null) return null;
  return Math.max(0, seatCap - verifiedPaid);
}
