import { Reveal } from "../ui/Reveal";
import { Eyebrow } from "../ui/Eyebrow";
import { Container } from "../ui/Container";

const CARDS = [
  { n: "01", label: "The Framework", q: "Which economic-law subjects form part of the programme?", a: "Understand the fundamental economic laws expressly identified in Module 11." },
  { n: "02", label: "The Matter", q: "What matters and disputes are included?", a: "Connect each included law with the matters and disputes listed by VLS." },
  { n: "03", label: "The Adjudication", q: "Where does adjudication enter the curriculum?", a: "Understand the adjudication-related areas included in Module 11." },
  { n: "04", label: "The Court Dimension", q: "Where does the Special Court component arise?", a: "Understand the PMLA Special Court component expressly included by VLS." },
];

export function PracticeGap() { return <section className="bg-vls-off-white py-14 md:py-20"><Container><Reveal className="max-w-2xl"><Eyebrow>The Practice Gap</Eyebrow><h2 className="mt-3 font-serif text-[32px] font-medium leading-tight text-vls-black md:text-[40px]">Knowing the name of a law is one thing.<br />Understanding its place in the programme is another.</h2><p className="mt-5 text-[17px] leading-relaxed text-vls-muted">Module 11 connects fundamental economic laws with the matters, disputes, adjudications and PMLA Special Court component identified by VLS.</p></Reveal><div className="mt-12 grid gap-x-10 md:grid-cols-2">{CARDS.map((card, i) => <Reveal key={card.n} delayMs={i * 70}><div className="card-lift flex h-full gap-5 border-t border-vls-border py-6 md:pr-4"><span className="font-serif text-[20px] font-medium text-vls-red">{card.n}</span><div><p className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-vls-red">{card.label}</p><p className="mt-2 font-serif text-[18px] font-medium text-vls-black">{card.q}</p><p className="mt-2 text-[15px] leading-relaxed text-vls-muted">{card.a}</p></div></div></Reveal>)}</div></Container></section>; }
