// Run after `next build`: no payment secret or server-only Razorpay code may ship to the browser.
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../.next/static");
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (/\.(js|css|json|html|map)$/.test(entry.name)) yield path;
  }
}

const forbidden = ["RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "api.razorpay.com", "verifyWebhookSignature", "createHmac"];
for (const value of [process.env.RAZORPAY_KEY_SECRET, process.env.RAZORPAY_WEBHOOK_SECRET]) if (value) forbidden.push(value);

let files = 0;
for await (const file of walk(root)) {
  files += 1;
  const text = await readFile(file, "utf8");
  for (const needle of forbidden) assert.ok(!text.includes(needle), `client bundle ${file} must not contain ${needle.slice(0, 12)}…`);
}
assert.ok(files > 0, "no client bundle files found — run the build first");
console.log(`Client bundle check passed: ${files} files, no server-only payment code or secrets.`);
