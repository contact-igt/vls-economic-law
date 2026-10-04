import Image from "next/image";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Eyebrow } from "../ui/Eyebrow";

const FACTS = [
  { value: "250+", label: "Tamil Nadu Judicial Services aspirants trained" },
  { value: "1,200+", label: "Tamil Nadu Civil Services candidates mentored" },
  { value: "Since 2003", label: "Mentoring in law, economy and public administration" },
];

export function Faculty() {
  return (
    <section id="faculty" className="bg-vls-off-white py-14 md:py-20">
      <Container className="grid gap-12 md:grid-cols-[280px_1fr] md:items-center">
        <Reveal>
          <div className="mx-auto w-[240px] bg-vls-off-white p-3 md:w-full md:max-w-[300px]">
            <div className="relative pt-10">
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 top-10 bg-vls-red"
              />
              <Image
                src="/assets/vls/faculty/dr-sivakumar.png"
                alt="Dr. Sivakumar Sivaprakasam"
                width={720}
                height={900}
                className="relative -mt-10 w-full"
                sizes="(min-width: 768px) 280px, 240px"
              />
            </div>
          </div>
        </Reveal>
        <Reveal delayMs={80}>
          <Eyebrow>Your Faculty</Eyebrow>
          <h2 className="mt-3 font-serif text-[28px] font-medium text-vls-black">
            Dr. Sivakumar Sivaprakasam
          </h2>
          <p className="mt-1 text-[15px] text-vls-muted">
            B.Sc., M.L., Ph.D. (Law) · Lawyer, Chennai High Court
          </p>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-vls-muted">
            Dr. Sivakumar has trained more than 250 Tamil Nadu Judicial Services aspirants and
            over 1,200 Tamil Nadu Civil Services candidates. Since 2003, he has mentored
            candidates across law, economy, and public administration for UPSC and TNPSC
            examinations.
          </p>
          <dl className="mt-6 grid max-w-xl grid-cols-3 gap-4 border-t border-vls-border pt-5">
            {FACTS.map((fact) => (
              <div key={fact.label}>
                <dt className="font-serif text-[24px] font-medium leading-none text-vls-red">{fact.value}</dt>
                <dd className="mt-2 text-[11px] font-bold uppercase leading-snug tracking-[1px] text-vls-muted">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </section>
  );
}
