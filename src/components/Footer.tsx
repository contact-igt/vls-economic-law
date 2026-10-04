import Image from "next/image";
import Link from "next/link";
import { Container } from "./ui/Container";

const EXPLORE_LINKS = [
  { href: "https://www.vlslawacademy.com/", label: "Home" },
  { href: "https://www.vlslawacademy.com/", label: "Courses" },
  { href: "#why-this-course", label: "Why VLS" },
  { href: "#faqs", label: "Contact" },
];

const SOCIAL_LINKS = [
  { href: "https://www.youtube.com/@VLSLAWACADEMY", label: "YouTube" },
  { href: "https://www.instagram.com/vlslawacademy/", label: "Instagram" },
  { href: "https://www.linkedin.com/company/105212369/", label: "LinkedIn" },
  { href: "https://www.facebook.com/vlslawacademy", label: "Facebook" },
];

export function Footer() {
  return (
    <footer id="site-footer" className="bg-vls-footer-black pb-6 pt-16 text-white" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
      <Container>
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-[1.4fr_0.8fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Image
                src="/assets/vls/brand/vls-logo.png"
                alt="VLS Law Academy"
                width={88}
                height={88}
                className="shrink-0 bg-white p-2"
              />
            </div>
            <p className="mt-5 max-w-xs text-[14px] leading-relaxed text-[#a5a5a1]">
              Practical legal knowledge for judicial services, law practice, and professional
              growth.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-[#8a8a86]">
              Explore
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-[#d0d0cd] transition-opacity duration-150 ease-out hover:opacity-70"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-[#8a8a86]">
              Contact
            </p>
            <p className="mt-4 max-w-xs text-[14px] leading-relaxed text-[#d0d0cd]">
              No. 1910, 2nd Floor, H Block 5th Street, 12th Main Road, Anna Nagar West,
              Chennai.
            </p>
            <p className="mt-3 text-[14px] text-[#d0d0cd]">
              <Link href="tel:+919500207811" className="hover:opacity-70">
                +91 95002 07811
              </Link>
              <br />
              <Link href="tel:+919500025216" className="hover:opacity-70">
                +91 95000 25216
              </Link>
            </p>

            <p className="mt-6 text-[11px] font-extrabold uppercase tracking-[1.4px] text-[#8a8a86]">
              Follow VLS
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              {SOCIAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] text-[#d0d0cd] hover:opacity-70"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[13px] text-[#8a8a86] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 VLS Law Academy. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="#" className="hover:opacity-70">
              Terms
            </Link>
            <Link href="#" className="hover:opacity-70">
              Privacy Policy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
