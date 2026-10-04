// End-to-end payment checks against an in-process fake Razorpay + fake registration sheet.
// Real HMAC signatures, real route handlers, no network.
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);

const KEY_ID = "rzp_test_flow";
const KEY_SECRET = "flow_key_secret";
const WEBHOOK_SECRET = "flow_webhook_secret";
process.env.RAZORPAY_KEY_ID = KEY_ID;
process.env.RAZORPAY_KEY_SECRET = KEY_SECRET;
process.env.RAZORPAY_WEBHOOK_SECRET = WEBHOOK_SECRET;
process.env.GOOGLE_SHEET_WEBAPP_URL = "https://sheet.test/exec";

const DEADLINE = Date.parse("2026-10-10T18:00:00+05:30");
const realNow = Date.now;
const setNow = (ms) => { Date.now = () => ms; };
setNow(Date.parse("2026-10-05T10:00:00+05:30"));

const calls = { razorpay: [], sheet: [], backend: [] };
const orders = new Map();
const payments = new Map();
const sheetIds = new Set();
let sheetDown = false;

globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  const method = init.method || "GET";
  if (url.startsWith("https://api.razorpay.com/v1")) {
    const path = url.slice("https://api.razorpay.com/v1".length);
    assert.equal(init.headers.Authorization, "Basic " + Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64"));
    calls.razorpay.push({ method, path, body: init.body ? JSON.parse(init.body) : null });
    if (method === "POST" && path === "/orders") {
      const body = JSON.parse(init.body);
      const order = { id: `order_${orders.size + 1}`, ...body };
      orders.set(order.id, order);
      return Response.json(order);
    }
    const [, kind, id] = path.split("/");
    const entity = (kind === "orders" ? orders : payments).get(id);
    return entity ? Response.json(entity) : new Response("{}", { status: 404 });
  }
  if (url === process.env.GOOGLE_SHEET_WEBAPP_URL) {
    if (sheetDown) return new Response("{}", { status: 500 });
    const params = new URLSearchParams(init.body);
    const id = params.get("razorpay_payment_id");
    calls.sheet.push(Object.fromEntries(params));
    if (sheetIds.has(id)) return Response.json({ result: "duplicate" });
    sheetIds.add(id);
    return Response.json({ result: "success" });
  }
  calls.backend.push(url);
  return Response.json({ ok: true });
};

const create = await import("../src/app/api/create-order/route.ts");
const verify = await import("../src/app/api/verify-payment/route.ts");
const webhook = await import("../src/app/api/razorpay-webhook/route.ts");

const post = (handler, body, headers = {}) =>
  handler.POST(new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) }));
const sign = (text, secret) => createHmac("sha256", secret).update(text).digest("hex");
const reset = () => { calls.razorpay.length = 0; calls.sheet.length = 0; calls.backend.length = 0; };

const student = { name: "Test Student", email: "Test@Example.com", mobile: "9876543210", utm_source: "facebook.com", utm_medium: "paid", utm_campaign: "econ-laws", utm_term: "", utm_content: "reel-1", cta_source: "sticky_mobile" };

async function placeOrder(extra = {}) {
  const res = await post(create, { ...student, ...extra });
  assert.equal(res.status, 200);
  return res.json();
}
function capture(order, patch = {}) {
  const payment = { id: `pay_${payments.size + 1}`, order_id: order.orderId, amount: order.amount, currency: "INR", status: "captured", method: "upi", created_at: Math.floor(Date.now() / 1000), ...patch };
  payments.set(payment.id, payment);
  return payment;
}
const checkout = (order, payment) => ({ razorpay_order_id: order.orderId, razorpay_payment_id: payment.id, razorpay_signature: sign(`${order.orderId}|${payment.id}`, KEY_SECRET) });
const event = (payment, name = "payment.captured") => JSON.stringify({ event: name, payload: { payment: { entity: { id: payment.id } } } });
const deliver = (payment, name, secret = WEBHOOK_SECRET) => { const raw = event(payment, name); return post(webhook, raw, { "x-razorpay-signature": sign(raw, secret) }); };

// 1 + 5. Browser-controlled amount is ignored: amount=1 still creates a 49900 paise order.
reset();
let res = await post(create, { ...student, amount: 1, fee: 1, price: 1 });
assert.equal(res.status, 200);
let order = await res.json();
assert.deepEqual(Object.keys(order).sort(), ["amount", "currency", "keyId", "orderId"]);
assert.equal(order.amount, 49900);
assert.equal(order.currency, "INR");
assert.equal(order.keyId, KEY_ID);
assert.ok(!JSON.stringify(order).includes(KEY_SECRET));
assert.equal(calls.razorpay[0].body.amount, 49900);
assert.equal(calls.razorpay[0].body.notes.programme_id, "economic-laws-practice");
assert.equal(calls.razorpay[0].body.notes.email, "test@example.com");
assert.equal(calls.razorpay[0].body.notes.utm_campaign, "econ-laws");
assert.equal(calls.razorpay[0].body.notes.cta_source, "sticky_mobile");

// 6. Direct / malformed create-order requests never reach the provider.
reset();
for (const bad of ["not json", {}, { amount: 499 }, { ...student, mobile: "123" }, { ...student, email: "nope" }, { ...student, name: "" }]) {
  res = await post(create, bad);
  assert.equal(res.status, 400);
}
assert.equal(calls.razorpay.length, 0);

// 8. Registration closes at the class start: order creation is rejected server-side.
reset();
setNow(DEADLINE - 1000);
assert.equal((await post(create, student)).status, 200, "still open one second before the class");
reset();
setNow(DEADLINE);
res = await post(create, student);
assert.equal(res.status, 403);
assert.equal(calls.razorpay.length, 0, "no provider call at/after the class start");
setNow(DEADLINE + 3_600_000);
assert.equal((await post(create, student)).status, 403);
setNow(Date.parse("2026-10-05T10:00:00+05:30"));

// 4. Malformed / foreign signature is rejected and nothing is recorded.
reset();
order = await placeOrder();
let payment = capture(order);
reset();
res = await post(verify, { ...checkout(order, payment), razorpay_signature: "deadbeef" });
assert.equal(res.status, 400);
res = await post(verify, { ...checkout(order, payment), razorpay_signature: sign(`${order.orderId}|${payment.id}`, "wrong_secret") });
assert.equal(res.status, 400);
res = await post(verify, { razorpay_order_id: order.orderId });
assert.equal(res.status, 400);
assert.equal(calls.razorpay.length + calls.sheet.length, 0, "invalid signature never reaches Razorpay or the sheet");

// 1. Successful payment: verified, recorded once, UTM retained.
res = await post(verify, checkout(order, payment));
assert.equal(res.status, 200);
const paid = await res.json();
assert.deepEqual(paid, {
  status: "paid", paymentId: payment.id, orderId: order.orderId, amount: 499, currency: "INR",
  courseName: "Economic Laws & Practice", name: "Test Student", email: "t•••@example.com", mobile: "+91 98••••3210",
});
assert.ok(!JSON.stringify(paid).includes("test@example.com") && !JSON.stringify(paid).includes("9876543210"), "response must mask contact details");
assert.equal(calls.sheet.length, 1);
assert.equal(calls.sheet[0].razorpay_payment_id, payment.id);
assert.equal(calls.sheet[0].payment_status, "paid");
assert.equal(calls.sheet[0].amount, "499");
assert.equal(calls.sheet[0].utm_source, "facebook.com");
assert.equal(calls.sheet[0].utm_content, "reel-1");
assert.equal(calls.sheet[0].mobile, "+919876543210");
assert.equal(calls.sheet[0].payment_method, "upi");
assert.equal(calls.sheet[0].cta_source, "sticky_mobile");

// 7 + 9. Duplicate webhooks / refresh-style repeat verifies are idempotent: still exactly one row.
res = await deliver(payment, "payment.captured");
assert.equal((await res.json()).status, "duplicate");
res = await deliver(payment, "order.paid");
assert.equal((await res.json()).status, "duplicate");
res = await post(verify, checkout(order, payment));
assert.equal(res.status, 200);
assert.equal(calls.sheet.length, 1, "duplicate events must not create a second registration");

// Webhook authenticity.
reset();
res = await deliver(payment, "payment.captured", "wrong_secret");
assert.equal(res.status, 400);
res = await post(webhook, event(payment), {});
assert.equal(res.status, 400);
assert.equal(calls.razorpay.length, 0);
const savedSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
delete process.env.RAZORPAY_WEBHOOK_SECRET;
assert.equal((await deliver(payment)).status, 500, "webhook fails closed without a secret");
process.env.RAZORPAY_WEBHOOK_SECRET = savedSecret;

// Webhook alone records a payment whose browser callback never arrived; fires once.
order = await placeOrder();
payment = capture(order);
reset();
res = await deliver(payment, "payment.captured");
assert.equal((await res.json()).status, "recorded");
assert.equal(calls.sheet.length, 1);

// 2. Failed / authorized / foreign / wrong-amount payments are never marked paid.
order = await placeOrder();
payment = capture(order, { status: "failed" });
reset();
assert.equal((await post(verify, checkout(order, payment))).status, 400);
assert.equal((await deliver(payment)).status, 200);
assert.equal(calls.sheet.length, 0);

order = await placeOrder();
payment = capture(order, { status: "authorized" });
reset();
res = await post(verify, checkout(order, payment));
assert.equal(res.status, 202);
assert.deepEqual(await res.json(), { status: "pending" });
assert.equal(calls.sheet.length, 0);

order = await placeOrder();
orders.get(order.orderId).notes.programme_id = "other-vls-page";
payment = capture(order);
reset();
assert.equal((await post(verify, checkout(order, payment))).status, 400);
assert.equal((await (await deliver(payment)).json()).status, "ignored");
assert.equal(calls.sheet.length, 0);

order = await placeOrder();
orders.get(order.orderId).amount = 100;
payment = capture(order, { amount: 100 });
reset();
assert.equal((await post(verify, checkout(order, payment))).status, 400, "an order below the configured fee is never accepted");
assert.equal(calls.sheet.length, 0);

order = await placeOrder();
payment = capture(order);
reset();
assert.equal((await post(verify, { ...checkout(order, payment), razorpay_order_id: "order_other", razorpay_signature: sign(`order_other|${payment.id}`, KEY_SECRET) })).status, 400, "payment must belong to the signed order");
assert.equal((await deliver(payment, "payment.failed")).status, 200);
assert.equal(calls.sheet.length, 0);

// A payment already taken before the deadline is still honoured after it.
order = await placeOrder();
payment = capture(order);
setNow(DEADLINE + 60_000);
reset();
assert.equal((await post(verify, checkout(order, payment))).status, 200);
assert.equal(calls.sheet.length, 1);
setNow(Date.parse("2026-10-05T10:00:00+05:30"));

// Sheet outage: user still sees verified success, webhook retry is rejected so Razorpay redelivers, then records once.
order = await placeOrder();
payment = capture(order);
reset();
sheetDown = true;
assert.equal((await post(verify, checkout(order, payment))).status, 200);
assert.equal((await deliver(payment)).status, 500);
sheetDown = false;
assert.equal((await (await deliver(payment)).json()).status, "recorded");
assert.equal((await (await deliver(payment)).json()).status, "duplicate");
assert.equal(sheetIds.has(payment.id), true);

Date.now = realNow;
console.log("Payment flow checks passed: server-derived amount, deadline, signature, capture verification, webhook, idempotency.");
