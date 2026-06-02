"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  /** Side the curtain slides OFF toward. Default: "left". */
  slideFrom?: "left" | "right";
  /** Tailwind aspect class (e.g. "aspect-[5/4]"). */
  aspect?: string;
  className?: string;
};

/**
 * Editorial slide-reveal — a dark curtain panel covers the image, then slides
 * off when the section enters the viewport. The image itself zooms subtly from
 * 1.12 → 1 over the same window so it feels like the curtain "uncovers" motion.
 */
export function RevealImage({
  src,
  alt,
  slideFrom = "left",
  aspect = "aspect-[5/4]",
  className,
}: Props) {
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
          setRevealed(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Use inline style for transforms — Tailwind v4 uses the standalone
  // `translate` / `transform` properties, which can break `transition-transform`
  // when combined with arbitrary values.
  const curtainTransform = revealed
    ? slideFrom === "left"
      ? "translate3d(-101%, 0, 0)"
      : "translate3d(101%, 0, 0)"
    : "translate3d(0, 0, 0)";

  const imgTransform = revealed ? "scale(1)" : "scale(1.12)";

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden bg-zinc-100", aspect, className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 size-full object-cover will-change-transform"
        style={{
          transform: imgTransform,
          transition: "transform 1400ms cubic-bezier(0.22, 1, 0.36, 1) 100ms",
        }}
      />

      {/* Dark curtain — slides off in the direction `slideFrom` */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gray-200 will-change-transform"
        style={{
          transform: curtainTransform,
          transition: "transform 1100ms cubic-bezier(0.77, 0, 0.18, 1)",
        }}
      />

      {/* Subtle inner highlight on the curtain for texture — fades with it */}
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
