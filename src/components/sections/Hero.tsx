"use client";

import { PrimaryLink, SecondaryLink } from "../ui/Button";
import { Container } from "../ui/Container";
import { RegistrationForm } from "../RegistrationForm";
import { Countdown } from "../Countdown";
import { CtaNote } from "../CtaNote";
import { SessionSummary } from "../SessionSummary";
import { useCourse } from "@/components/CourseProvider";

// Verified VLS institutional proof — not results of this session.
const PROOF = [
  { value: "5,000+", label: "Students" },
  { value: "1,000+", label: "Rank Holders" },
  { value: "250+", label: "Judicial Services Aspirants Trained" },
  { value: "1,200+", label: "Civil Services Candidates Mentored" },
];

export function Hero() {
  const course = useCourse();
  return <section id="top" className="relative overflow-hidden bg-vls-near-black pb-14 pt-14 md:pb-16">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
    <div aria-hidden="true" className="hero-rise pointer-events-none absolute right-0 top-0 h-[440px] w-[440px] opacity-30" style={{ background: "radial-gradient(440px at 72% 22%, rgba(223,185,120,0.25), transparent 70%)", animationDuration: "1.2s" }} />
    <Container className="relative grid gap-10 md:grid-cols-2 md:items-start md:gap-8"><div className="flex flex-col">
      <p className="hero-rise text-[11px] font-extrabold uppercase tracking-[1.8px] text-vls-gold">FOUNDATION COURSE</p>
      <h1 aria-label="Economic Laws & Practice" className="hero-rise mt-5 font-serif text-[40px] font-medium leading-[1.05] tracking-tight text-white sm:text-[52px] md:mt-6 md:text-[60px]" style={{ animationDelay: "70ms" }}>Economic Laws &amp; <span className="italic text-vls-gold">Practice</span></h1>
      <p className="hero-rise mt-4 max-w-xl text-[12px] font-extrabold uppercase tracking-[1.6px] text-vls-gold sm:text-[13px] md:mt-5" style={{ animationDelay: "120ms" }}>Benami <span aria-hidden="true">•</span> Black Money <span aria-hidden="true">•</span> Money Laundering Laws</p>
      <p aria-label="Procedure & Practice" className="hero-rise mt-3 font-serif text-[22px] font-medium italic text-white sm:text-[26px] md:mt-4" style={{ animationDelay: "140ms" }}>{course.subtitle}</p>
      <ul className="hero-rise mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-white/10 pt-5 sm:grid-cols-4 md:mt-8" style={{ animationDelay: "200ms" }}>{course.heroMetaCards.map((card) => <InfoChip key={card.label} label={card.label} value={card.value} />)}</ul>
      <div id="hero-conversion">
      <div className="hero-rise mt-6" style={{ animationDelay: "260ms" }}><Countdown /></div>
      <div className="hero-rise mt-6" style={{ animationDelay: "320ms" }}><div className="flex flex-wrap items-center gap-x-6 gap-y-3"><PrimaryLink href="#hero-register-form">{course.ctaLabel}</PrimaryLink><SecondaryLink href="#curriculum" dark>{course.secondaryCtaLabel}</SecondaryLink></div><CtaNote dark className="mt-3 max-w-md" /></div>
      </div>
      <p className="hero-rise mt-8 max-w-xl text-[19px] font-medium leading-snug text-white max-md:order-1" style={{ animationDelay: "200ms" }}>Understand the Law. Understand the Adjudication. Understand the Practice.</p>
      <p className="hero-rise mt-4 max-w-xl text-[16px] leading-relaxed text-[#c8c8c4] max-md:order-1" style={{ animationDelay: "260ms" }}>Go beyond recognising the name of an economic law. Build a structured understanding of the legal framework, matters, disputes, adjudications and the PMLA Special Court component included in the VLS curriculum.</p>
    </div><div id="hero-register-form" className="hero-rise relative bg-white p-7 sm:p-8" style={{ animationDelay: "180ms" }}><div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-vls-red to-vls-gold" /><div><p className="eyebrow">{course.eyebrow}</p><h2 className="mt-2 font-serif text-[24px] font-medium text-vls-black">{course.formHeading}</h2></div><SessionSummary /><div className="mt-6"><RegistrationForm formId="hero" /></div></div></Container>
    <Container className="relative mt-12"><ul aria-label="VLS Law Academy in numbers" className="grid grid-cols-2 gap-x-6 gap-y-6 border-t border-white/10 pt-6 md:grid-cols-4">{PROOF.map((item) => <li key={item.label}><p className="font-serif text-[26px] font-medium leading-none text-vls-gold md:text-[30px]">{item.value}</p><p className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-[1.2px] text-[#c8c8c4]">{item.label}</p></li>)}</ul><p className="mt-5 text-[11px] uppercase tracking-[1.2px] text-[#8a8a86]">VLS Law Academy · institutional record</p></Container>
  </section>;
}

function InfoChip({ label, value }: { label: string; value: string }) { return <li><p className="text-[15px] font-semibold text-white">{value}</p><p className="mt-0.5 text-[12px] text-[#9a9a96]">{label}</p></li>; }
