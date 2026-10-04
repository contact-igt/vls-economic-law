import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);

// Credentials present so that, without the guard, the route would reach Razorpay.
process.env.RAZORPAY_KEY_ID = "rzp_test_guard";
process.env.RAZORPAY_KEY_SECRET = "guard_secret";

const providerCalls = [];
globalThis.fetch = async (...args) => {
  providerCalls.push(args);
  return Response.json({ id: "order_should_not_exist" });
};

const { POST } = await import("../src/app/api/create-order/route.ts");
const { programConfig } = await import("../src/lib/course.ts");
const { getRegistrationAction } = await import("../src/lib/programStatus.ts");
const { getCourse } = await import("../src/lib/course.ts");

const body = JSON.stringify({ name: "Guard Test", email: "guard@example.com", mobile: "9876543210", amount: 499 });
const request = () => POST(new Request("http://localhost/api/create-order", { method: "POST", headers: { "Content-Type": "application/json" }, body }));
const realNow = Date.now;

// Registration closes automatically at the class start time (10 October 2026, 6:00 PM IST).
const classStart = Date.parse(programConfig.classStartAt);
assert.equal(classStart, Date.parse("2026-10-10T12:30:00Z"));
for (const now of [classStart, classStart + 1, classStart + 86_400_000]) {
  Date.now = () => now;
  assert.equal(getRegistrationAction(programConfig), "closed");
  const response = await request();
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: "Payment registration is not open" });
}
assert.equal(providerCalls.length, 0, "Razorpay must not be called once registration has closed");
// The UI follows the same clock: after the class start the page offers no payment action.
const closed = getCourse(classStart);
assert.equal(closed.isPaid, false);
assert.equal(closed.ctaLabel, "Registration Closed");
assert.equal(closed.feeText, null);
assert.equal(getCourse(classStart - 1).ctaLabel, "Secure My Seat — ₹499");
Date.now = realNow;

console.log("Create-order guard checks passed: closed registration rejects order creation without calling the provider.");
