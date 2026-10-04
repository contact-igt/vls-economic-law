"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Container } from "../ui/Container";
import { Reveal } from "../ui/Reveal";
import { PrimaryLink } from "../ui/Button";
import { CtaNote } from "../CtaNote";
import { useCourse } from "@/components/CourseProvider";

const TESTIMONIALS = [
  { src: "/assets/vls/testimonials/testimonial-1.jpg", w: 705, h: 608 },
  { src: "/assets/vls/testimonials/testimonial-2.png", w: 601, h: 711 },
  { src: "/assets/vls/testimonials/testimonial-3.png", w: 477, h: 751 },
];

const VIDEOS = [
  "https://res.cloudinary.com/dd3olj1ax/video/upload/v1761892348/vls-testimonal3_ajrnrk.mp4",
  "https://res.cloudinary.com/dd3olj1ax/video/upload/v1762343697/vls_testimonal4_fmdamk.mp4",
  "https://res.cloudinary.com/dd3olj1ax/video/upload/v1761891831/vls-testimoanl1_ddcvpb.mp4",
];

export function Testimonials() {
  const course = useCourse();
  const slider = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  function closeVideo() {
    dialog.current?.close();
    setSelectedVideo(null);
  }

  return (
    <section className="bg-[#f9f2f2] py-14 md:py-20">
      <Container className="max-w-2xl text-center">
        <Reveal>
          <p className="text-[11px] font-extrabold uppercase tracking-[1.8px] text-vls-red">
            Student Voices
          </p>
          <h2 className="mt-3 font-serif text-[28px] font-medium leading-tight text-vls-black md:text-[34px]">
            Real VLS Student Experiences
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-vls-muted">
            Hear directly from learners who have experienced VLS practical legal training.
          </p>
        </Reveal>
      </Container>

      <Container className="mt-10">
        <div ref={slider} className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 sm:gap-5" aria-label="Student testimonials">
        {TESTIMONIALS.map((item, i) => (
          <div key={item.src} className="w-[86%] shrink-0 snap-start min-[576px]:w-[83.333%] min-[768px]:w-[58.823%] min-[992px]:w-[40%] min-[1200px]:w-[calc((100%-2.5rem)/3)]">
            <button
              type="button"
              aria-label={`Play student testimonial ${i + 1}`}
              onClick={() => {
                setSelectedVideo(VIDEOS[i]);
                dialog.current?.showModal();
              }}
              className="group relative block h-[460px] w-full cursor-pointer sm:h-[520px] overflow-hidden rounded-3xl shadow-md focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-vls-red"
            >
              <Image
                src={item.src}
                alt="VLS Law Academy student testimonial"
                width={item.w}
                height={item.h}
                className="img-zoom h-full w-full object-cover"
                sizes="(min-width: 640px) 33vw, 100vw"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <span className="testimonial-play-button absolute left-1/2 top-1/2 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-vls-red text-white transition-transform group-hover:scale-110">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              </span>
            </button>
          </div>
        ))}
        </div>
        <div className="mt-4 flex justify-center gap-4 min-[1200px]:hidden">
          <button type="button" aria-label="Previous testimonials" className="rounded-full border border-vls-red px-5 py-2 text-vls-red" onClick={() => slider.current?.scrollBy({ left: -slider.current.clientWidth, behavior: "smooth" })}>←</button>
          <button type="button" aria-label="Next testimonials" className="rounded-full border border-vls-red px-5 py-2 text-vls-red" onClick={() => slider.current?.scrollBy({ left: slider.current.clientWidth, behavior: "smooth" })}>→</button>
        </div>
        <div className="mt-10 text-center">
          <PrimaryLink href="#register-form">{course.ctaLabelWithFee}</PrimaryLink>
          <CtaNote className="mx-auto mt-3 max-w-md" />
        </div>
      </Container>
      <dialog
        ref={dialog}
        aria-label="Student testimonial video"
        className="fixed inset-0 m-auto w-[min(900px,92vw)] max-w-none overflow-visible rounded-2xl bg-black p-3 backdrop:bg-black/75"
        onCancel={closeVideo}
        onClose={() => setSelectedVideo(null)}
        onClick={(event) => { if (event.target === event.currentTarget) closeVideo(); }}
      >
        <div className="relative">
          <button type="button" autoFocus aria-label="Close testimonial video" onClick={closeVideo} className="testimonial-close-button absolute right-2 top-2 z-10 flex size-10 items-center justify-center bg-vls-red text-2xl text-white">×</button>
          {selectedVideo && <video key={selectedVideo} src={selectedVideo} controls autoPlay playsInline className="max-h-[80dvh] min-h-40 w-full rounded-lg">Your browser does not support video playback.</video>}
        </div>
      </dialog>
    </section>
  );
}
