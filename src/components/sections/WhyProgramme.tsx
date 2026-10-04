import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { NumberedRow } from "../ui/NumberedRow";
import { SecondaryLink } from "../ui/Button";
const POINTS = [{ n: "01", title: "Understand the fundamental laws" }, { n: "02", title: "Connect laws with matters and disputes" }, { n: "03", title: "Understand adjudication and the PMLA Special Court component" }];
export function WhyProgramme() { return <section className="bg-white py-14 md:py-20"><Container className="grid gap-10 md:grid-cols-2 md:gap-16"><Reveal><h2 className="font-serif text-[30px] font-medium leading-tight text-vls-black md:text-[36px]">Economic Laws Go Beyond the Name of the Act.</h2><p className="mt-5 text-[16px] leading-relaxed text-vls-muted">The programme gives the Module 11 subjects a structured learning context: the fundamental framework, the matters and disputes included by VLS, and the adjudication dimension.</p><div className="mt-6"><SecondaryLink href="#curriculum">See what you&apos;ll learn ↗</SecondaryLink></div></Reveal><Reveal delayMs={100}><div>{POINTS.map((p) => <NumberedRow key={p.n} number={p.n} title={p.title} />)}</div></Reveal></Container></section>; }
