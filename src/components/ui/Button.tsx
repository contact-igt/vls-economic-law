"use client";

import Link from "next/link";
import { MouseEvent, ReactNode } from "react";

type BaseProps = {
  children: ReactNode;
  className?: string;
};

function scrollToHash(event: MouseEvent<HTMLAnchorElement>, href: string) {
  if (!href.startsWith("#")) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return;

  event.preventDefault();
  history.pushState(null, "", href);
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PrimaryLink({
  href,
  children,
  className = "",
}: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      onClick={(event) => scrollToHash(event, href)}
      className={`inline-flex h-12 items-center justify-center gap-2 bg-vls-red px-6 text-[14px] font-bold tracking-tight text-vls-white transition-[background-color,transform] duration-150 ease-out hover:bg-vls-red-dark motion-safe:hover:-translate-y-px active:translate-y-0 ${className}`}
    >
      {children}
    </Link>
  );
}

export function SecondaryLink({
  href,
  children,
  className = "",
  dark = false,
}: BaseProps & { href: string; dark?: boolean }) {
  return (
    <Link
      href={href}
      onClick={(event) => scrollToHash(event, href)}
      className={`inline-flex items-center gap-2 text-[14px] font-bold tracking-tight underline decoration-1 underline-offset-4 transition-opacity duration-150 ease-out hover:opacity-70 ${
        dark ? "text-vls-white" : "text-vls-black"
      } ${className}`}
    >
      {children}
    </Link>
  );
}

export function HeaderCta({ href, children }: BaseProps & { href: string }) {
  return (
    <Link
      href={href}
      onClick={(event) => scrollToHash(event, href)}
      className="inline-flex h-12 items-center justify-center bg-vls-black px-5 text-[13px] font-bold text-vls-white transition-[background-color,transform] duration-150 ease-out hover:bg-vls-near-black motion-safe:hover:-translate-y-px active:translate-y-0"
    >
      {children}
    </Link>
  );
}
