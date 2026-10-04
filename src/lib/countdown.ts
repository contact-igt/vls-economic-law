/** Time left until an absolute timestamp, split for display. Pure: every consumer derives from the same target. */
export function breakdown(startsAtMs: number, nowMs: number) {
  const left = Math.max(0, startsAtMs - nowMs);
  const s = Math.floor(left / 1000);
  return {
    left,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
