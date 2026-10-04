"use client";
import { useId, useState } from "react";
import { useCourse } from "@/components/CourseProvider";
import type { getCourse } from "@/lib/course";
const DYNAMIC: Record<string, (course: ReturnType<typeof getCourse>) => string> = {
  "When is the session?": (course) => course.faqSessionAnswer,
  "How long is the session?": (course) => course.faqDurationAnswer,
  "What is the registration fee?": (course) => course.faqFeeAnswer,
  "How do I confirm my registration?": (course) => course.faqConfirmAnswer,
  "What happens after payment?": (course) => course.faqAfterPaymentAnswer,
};
function answerFor(question: string, course: ReturnType<typeof getCourse>, fallback: string) { return DYNAMIC[question]?.(course) ?? fallback; }
const FAQS = [
  { q: "When is the session?", a: "" }, { q: "How long is the session?", a: "" }, { q: "What is the registration fee?", a: "" },
  { q: "What does Economic Laws & Practice cover?", a: "The programme covers the fundamental economic laws and the adjudication-related areas identified in Module 11, including the PMLA Special Court trial component." },
  { q: "Does the module include adjudication-related topics?", a: "Yes. Module 11 includes matters and disputes related to PMLA, the Benami Transaction Act and FEMA." },
  { q: "Does the module include Special Court matters?", a: "Yes. Module 11 includes trials before the Special Court for Prevention of Money Laundering Cases." },
  { q: "How do I confirm my registration?", a: "" }, { q: "What happens after payment?", a: "" },
];
export function Faq() { const course = useCourse(); const [openIndex, setOpenIndex] = useState<number | null>(0); const baseId = useId(); return <div className="divide-y divide-vls-border border-t border-vls-border">{FAQS.map((item, index) => { const isOpen = openIndex === index; const panelId = `${baseId}-panel-${index}`; const buttonId = `${baseId}-button-${index}`; return <div key={item.q}><h3><button id={buttonId} type="button" aria-expanded={isOpen} aria-controls={panelId} onClick={() => setOpenIndex(isOpen ? null : index)} className="flex w-full items-center justify-between gap-4 py-5 text-left text-vls-black transition-colors duration-150 ease-out hover:text-vls-red"><span className="font-serif text-[18px] font-medium">{item.q}</span><span aria-hidden="true" className={`shrink-0 text-xl text-vls-red transition-transform duration-200 ease-out ${isOpen ? "rotate-45" : ""}`}>+</span></button></h3><div id={panelId} role="region" aria-labelledby={buttonId} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}><div className="min-h-0 overflow-hidden" inert={!isOpen}><p className="pb-5 pr-10 text-[15px] leading-relaxed text-vls-muted">{answerFor(item.q, course, item.a)}</p></div></div></div>; })}</div>; }
