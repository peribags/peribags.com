"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AboutEditorialProps = {
  /** Small uppercase label above the heading. */
  kicker?: string;
  heading: ReactNode;
  body: string;
  /** Left tile — shorter than the right. */
  imageLeftSrc: string;
  imageLeftAlt: string;
  /** Right tile — taller, extends further down. */
  imageRightSrc: string;
  imageRightAlt: string;
  ctaHref: Route;
  ctaLabel: string;
  /** Section background. Default: near-black for the editorial moment. */
  background?: string;
};

/**
 * Dark editorial "about" section — twin staggered tiles on the left,
 * text + outlined CTA on the right. Each tile reveals with a curtain that
 * slides off when the section enters the viewport.
 */
export default function AboutEditorial({
  kicker,
  heading,
  body,
  imageLeftSrc,
  imageLeftAlt,
  imageRightSrc,
  imageRightAlt,
  ctaHref,
  ctaLabel,
  background = "#0A0A0A",
}: AboutEditorialProps) {
  return (
    <section style={{ backgroundColor: background }} className="text-white">
      <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-6 md:py-24 lg:px-[4vw] lg:py-28">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:items-center lg:gap-12">
          {/* ── Twin image collage ─────────────────────────────────────── */}
          <div className="grid grid-cols-2 items-start gap-3 md:gap-5">
            <RevealTile
              src={imageLeftSrc}
              alt={imageLeftAlt}
              slideFrom="left"
              aspectRatio="3 / 5"
              curtainColor={background}
            />
            <RevealTile
              src={imageRightSrc}
              alt={imageRightAlt}
              slideFrom="right"
              aspectRatio="3 / 5"
              curtainColor={background}
              delay={140}
            />
          </div>

          {/* ── Content ────────────────────────────────────────────────── */}
          <div className="lg:pl-4 xl:pl-12 flex flex-col items-start justify-end">
            {kicker && (
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
                {kicker}
              </p>
            )}
            <h2
              className={cn(
                "text-3xl font-light leading-[1.2] tracking-tight text-white sm:text-5xl lg:text-6xl",
                kicker && "mt-4",
              )}
            >
              {heading}
            </h2>
            <p className="mt-6 max-w-md text-base font-light leading-relaxed text-white/70">
              {body}
            </p>
            <Link
              href={ctaHref}
              className="mt-10 inline-flex rounded-full items-center justify-center border border-white px-7 py-3.5 text-sm font-medium tracking-tight text-white transition-colors hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// RevealTile — image + curtain that slides off when the tile enters view.
// Curtain colour is the section background so the reveal feels intrinsic
// rather than a hard-coded dark overlay.
// ────────────────────────────────────────────────────────────────────────────

function RevealTile({
  src,
  alt,
  slideFrom,
  aspectRatio,
  curtainColor,
  delay = 0,
}: {
  src: string;
  alt: string;
  slideFrom: "left" | "right";
  aspectRatio: string;
  curtainColor: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setRevealed(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.setTimeout(() => setRevealed(true), delay);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const curtainTransform = revealed
    ? slideFrom === "left"
      ? "translate3d(-101%, 0, 0)"
      : "translate3d(101%, 0, 0)"
    : "translate3d(0, 0, 0)";

  const imgTransform = revealed ? "scale(1)" : "scale(1.12)";

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden bg-zinc-900"
      style={{ aspectRatio }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
        style={{
          transform: imgTransform,
          transition: "transform 1400ms cubic-bezier(0.22, 1, 0.36, 1) 120ms",
        }}
      />

      {/* Curtain — same colour as the section background */}
      <div
        aria-hidden
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundColor: curtainColor,
          transform: curtainTransform,
          transition: "transform 1100ms cubic-bezier(0.77, 0, 0.18, 1)",
        }}
      />

      {/* Subtle highlight on the curtain so the slab doesn't feel flat */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 will-change-transform"
        style={{
          transform: curtainTransform,
          transition: "transform 1100ms cubic-bezier(0.77, 0, 0.18, 1)",
          background:
            "radial-gradient(60% 50% at 50% 50%, rgba(255,255,255,0.06), rgba(255,255,255,0) 60%)",
        }}
      />
    </div>
  );
}
