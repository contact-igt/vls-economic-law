import assert from "node:assert/strict";
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
console.log("Program status checks passed: paid window, deadline and seat-claim guard.");
