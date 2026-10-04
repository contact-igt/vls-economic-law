import assert from "node:assert/strict";
import { breakdown } from "../src/lib/countdown.ts";
import { getRegistrationAction, getSeatsRemaining, isRegistrationOpen } from "../src/lib/programStatus.ts";

const start = "2026-10-10T18:00:00+05:30";
const before = Date.parse("2026-10-05T00:00:00Z");
const open = { sessionStatus: "announced", classStartAt: start, fee: 499 };

assert.equal(getRegistrationAction(open, before), "payment");
assert.equal(isRegistrationOpen(open, before), true);
// Registration closes at the exact class start.
assert.equal(getRegistrationAction(open, Date.parse(start) - 1), "payment");
assert.equal(getRegistrationAction(open, Date.parse(start)), "closed");
// Paid registration needs a real positive fee and an announced session.
assert.equal(getRegistrationAction({ ...open, fee: null }, before), "unavailable");
assert.equal(getRegistrationAction({ ...open, fee: 0 }, before), "unavailable");
assert.equal(getRegistrationAction({ ...open, sessionStatus: "waitlist" }, before), "closed");
assert.equal(getRegistrationAction({ sessionStatus: "announced", classStartAt: "", fee: 499 }, before), "closed");
// No seat claim without a real cap and a verified paid count.
assert.equal(getSeatsRemaining(null, 12), null);
assert.equal(getSeatsRemaining(50, null), null);
assert.equal(getSeatsRemaining(50, 12), 38);
assert.equal(getSeatsRemaining(50, 80), 0);
// Countdown is an absolute deadline: a pure function of the target and the clock — it cannot restart.
const target = Date.parse(start);
assert.deepEqual(breakdown(target, target - (6 * 86400 + 2 * 3600 + 6 * 60 + 49) * 1000), { left: (6 * 86400 + 2 * 3600 + 6 * 60 + 49) * 1000, days: 6, hours: 2, minutes: 6, seconds: 49 });
assert.deepEqual(breakdown(target, target), { left: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
assert.equal(breakdown(target, target + 5000).left, 0);
assert.deepEqual(breakdown(target, Date.parse("2026-10-05T00:00:00Z")), breakdown(target, Date.parse("2026-10-05T00:00:00Z")));
console.log("Program status checks passed: paid window, deadline and seat-claim guard.");
