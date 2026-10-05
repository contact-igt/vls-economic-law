import assert from "node:assert/strict";
import { register } from "node:module";

register("./ts-resolve-hooks.mjs", import.meta.url);
const { googleCalendarUrl, icsContent } = await import("../src/lib/calendar.ts");

// 17 October 2026, 6:00 PM – 9:00 PM Asia/Kolkata = 12:30 – 15:30 UTC.
const url = new URL(googleCalendarUrl());
assert.equal(url.origin, "https://calendar.google.com");
assert.equal(url.searchParams.get("dates"), "20261017T123000Z/20261017T153000Z");
assert.equal(url.searchParams.get("text"), "Economic Laws & Practice — VLS Law Academy");
assert.equal(url.searchParams.get("ctz"), "Asia/Kolkata");

const ics = icsContent(new Date("2026-10-05T00:00:00Z"));
assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
assert.ok(ics.includes("DTSTART:20261017T123000Z\r\n"));
assert.ok(ics.includes("DTEND:20261017T153000Z\r\n"));
assert.ok(ics.includes("SUMMARY:Economic Laws & Practice — VLS Law Academy\r\n"));
assert.ok(!/https?:\/\//.test(ics) && !url.searchParams.get("details").match(/https?:\/\//), "no meeting URL may be invented");
console.log("Calendar checks passed: Google link and .ics carry 17 Oct 2026, 6–9 PM IST, no meeting URL.");
