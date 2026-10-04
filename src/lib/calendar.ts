import { programConfig } from "./course";

const TITLE = "Economic Laws & Practice — VLS Law Academy";
// No meeting URL is included: VLS shares joining details through the registered contact information.
const DETAILS = "Economic Laws & Practice Foundation Course by VLS Law Academy. VLS will share the session access details through your registered contact information.";

const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: TITLE,
    dates: `${stamp(programConfig.classStartAt)}/${stamp(programConfig.classEndAt)}`,
    details: DETAILS,
    ctz: "Asia/Kolkata",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function icsContent(now = new Date()) {
  const escape = (text: string) => text.replace(/[,;]/g, (c) => `\\${c}`);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//VLS Law Academy//Economic Laws & Practice//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${programConfig.pageName}-${stamp(programConfig.classStartAt)}@vlslawacademy.com`,
    `DTSTAMP:${stamp(now.toISOString())}`,
    `DTSTART:${stamp(programConfig.classStartAt)}`,
    `DTEND:${stamp(programConfig.classEndAt)}`,
    `SUMMARY:${escape(TITLE)}`,
    `DESCRIPTION:${escape(DETAILS)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
