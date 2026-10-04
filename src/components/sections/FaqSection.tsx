import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { Eyebrow } from "../ui/Eyebrow";
import { Faq } from "../Faq";

export function FaqSection() {
  return (
    <section id="faqs" className="bg-vls-off-white py-14 md:py-20">
      <Container className="max-w-2xl">
        <Reveal>
          <Eyebrow>Frequently Asked Questions</Eyebrow>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="font-serif text-[30px] font-medium leading-tight text-vls-black md:text-[34px]">
              Clear Answers Before You Begin.
            </h2>
            <a
              href="https://wa.me/919500025216"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-[14px] font-bold text-vls-red underline decoration-1 underline-offset-4"
            >
              Ask VLS on WhatsApp ↗
            </a>
          </div>
        </Reveal>

        <Reveal delayMs={80} className="mt-8">
          <Faq />
        </Reveal>
      </Container>
    </section>
  );
}
