// Test-only preload for browser E2E: `NODE_OPTIONS="--require scripts/e2e/mock-razorpay.cjs" next start`.
// Replaces ONLY outbound calls to Razorpay, the registration sheet and the VLS backend. The app's own
// routes, signature checks and verification logic run unchanged. Orders live in a small JSON file (E2E_STORE) so they
// are shared across Next's server processes; ids are short like Razorpay's. Sheet writes are appended to E2E_LOG
// (one JSON line each). Payment ids encode their status: pay_captured_<n>, pay_failed_<n>, pay_authorized_<n>.
const fs = require("node:fs");
const crypto = require("node:crypto");

const LOG = process.env.E2E_LOG;
const STORE = process.env.E2E_STORE;
const load = () => (STORE && fs.existsSync(STORE) ? JSON.parse(fs.readFileSync(STORE, "utf8")) : {});
const save = (orders) => STORE && fs.writeFileSync(STORE, JSON.stringify(orders));
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

if (process.env.E2E_NOW) {
  const fixed = Date.parse(process.env.E2E_NOW);
  Date.now = () => fixed;
}

const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init = {}) => {
  const url = String(typeof input === "string" ? input : input.url ?? input);
  if (url.startsWith("https://api.razorpay.com/v1")) {
    const path = url.slice("https://api.razorpay.com/v1".length);
    if (init.method === "POST" && path === "/orders") {
      const body = JSON.parse(init.body);
      const key = crypto.randomBytes(5).toString("hex");
      const order = { id: `order_${key}`, amount: body.amount, currency: body.currency, receipt: body.receipt, notes: body.notes };
      const orders = load();
      orders[key] = order;
      save(orders);
      return json(order);
    }
    const orderMatch = path.match(/^\/orders\/order_(\w+)$/);
    if (orderMatch) {
      const order = load()[orderMatch[1]];
      return order ? json(order) : json({ error: "not found" }, 404);
    }
    const payMatch = path.match(/^\/payments\/pay_(captured|failed|authorized)_(\w+)$/);
    if (payMatch) {
      const order = load()[payMatch[2]];
      if (!order) return json({ error: "not found" }, 404);
      return json({ id: `pay_${payMatch[1]}_${payMatch[2]}`, order_id: order.id, amount: order.amount, currency: "INR", status: payMatch[1], method: "upi", created_at: Math.floor(Date.now() / 1000) });
    }
    return json({ error: "not found" }, 404);
  }
  if (url === process.env.GOOGLE_SHEET_WEBAPP_URL) {
    const params = Object.fromEntries(new URLSearchParams(init.body));
    const seen = LOG && fs.existsSync(LOG) && fs.readFileSync(LOG, "utf8").split("\n").some((line) => line && JSON.parse(line).razorpay_payment_id === params.razorpay_payment_id);
    if (LOG) fs.appendFileSync(LOG, JSON.stringify(params) + "\n");
    return json({ result: seen ? "duplicate" : "success" });
  }
  if (url.includes("/vls-economic-laws/register")) return json({ ok: true });
  return realFetch(input, init);
};
