"use client";

import { type CSSProperties, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const SLIDE_DURATION_MS = 5000;
const FADE_MS = 2000;

export type HeroMedia = { type: "image" | "video"; url: string };

/** Normalized slide the carousel renders. Media URLs are already resolved. */
export type HeroBannerSlide = {
  id: string;
  /** Desktop / default media. */
  desktopMedia?: HeroMedia;
  /** Optional mobile override — used below the `lg` breakpoint. */
  mobileMedia?: HeroMedia;
  alt: string;
  kicker?: string;
  heading?: string;
  description?: string;
  cta?: { label: string; href: string };
  /** Tailwind classes for the gradient backdrop. */
  gradient?: string;
};

export default function Hero({
  slides,
  heightDesktop,
  heightMobile,
}: {
  slides: HeroBannerSlide[];
  /** CSS height (e.g. "640px", "80vh"). Falls back to responsive default. */
  heightDesktop?: string | null;
  heightMobile?: string | null;
}) {
  const [active, setActive] = useState(0);
  const total = slides.length;

  const go = (next: number) => {
    if (total === 0) return;
    setActive(((next % total) + total) % total);
  };

  // Auto-advance — runs continuously, doesn't pause on interaction.
  useEffect(() => {
    if (total <= 1) return;
    const t = window.setTimeout(() => {
      setActive((i) => (i + 1) % total);
    }, SLIDE_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [active, total]);

  if (total === 0) return null;

  const pad = (n: number) => String(n + 1).padStart(2, "0");

  // Each height falls back to the other; both feed CSS vars so the height can
  // differ per breakpoint. When neither is set, use the responsive default.
  const hasCustomHeight = Boolean(heightDesktop || heightMobile);
  const desktopH = heightDesktop ?? heightMobile ?? undefined;
  const mobileH = heightMobile ?? heightDesktop ?? undefined;

  return (
    <section
      className="relative isolate overflow-hidden bg-zinc-950 text-white"
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div
        className={cn(
          "relative",
          hasCustomHeight
            ? "h-[var(--banner-h-mobile)] lg:h-[var(--banner-h-desktop)]"
            : "h-[60vh] lg:h-[100svh]",
        )}
        style={
          hasCustomHeight
            ? ({
                "--banner-h-mobile": mobileH,
                "--banner-h-desktop": desktopH,
              } as CSSProperties)
            : undefined
        }
      >
        {slides.map((slide, i) => (
          <SlideView
            key={slide.id}
            slide={slide}
            active={i === active}
            priority={i === 0}
          />
        ))}

        {/* Bottom-right cluster: progress lines, counter, arrows. */}
        {total > 1 && (
          <div className="absolute bottom-6 right-5 z-30 flex flex-col items-end gap-5 sm:bottom-8 sm:right-8 lg:bottom-10 lg:right-12">
            {/* Progress lines — one per slide; active line fills over duration. */}
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show slide ${i + 1}`}
                  aria-current={i === active}
                  className="relative h-px w-8 overflow-hidden bg-white/25 transition-colors duration-300 hover:bg-white/40 sm:w-12"
                >
                  {i < active && (
                    <span className="absolute inset-0 bg-white/80" aria-hidden />
                  )}
                  {i === active && (
                    <span
                      key={`fill-${i}`}
                      className="absolute inset-0 origin-left bg-white"
                      style={{
                        animation: `hero-progress ${SLIDE_DURATION_MS}ms linear forwards`,
                        transformOrigin: "left",
                      }}
                      aria-hidden
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Counter + arrows */}
            <div className="flex items-center gap-4">
              <div className="font-mono text-[11px] tracking-[0.22em] tabular-nums text-white/60">
                <span className="text-base font-medium text-white">
                  {pad(active)}
                </span>
                <span className="mx-1.5">/</span>
                <span>{pad(total - 1)}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => go(active - 1)}
                  aria-label="Previous slide"
                  className="group/btn grid size-10 place-items-center rounded-full border border-white/25 text-white/85 transition-all duration-200 hover:border-white hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <ArrowLeft className="size-4 transition-transform duration-200 group-hover/btn:-translate-x-0.5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(active + 1)}
                  aria-label="Next slide"
                  className="group/btn grid size-10 place-items-center rounded-full border border-white/25 text-white/85 transition-all duration-200 hover:border-white hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                >
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

const TEXT_ENTRY = [
  // Hidden + offset by default; no transition so it snap-resets under the fading slide.
  "translate-y-8 opacity-0 transition-none will-change-[transform,opacity]",
  // When active: settle in with motion + delay (stagger applied per element).
  "data-[active=true]:translate-y-0 data-[active=true]:opacity-100",
  "data-[active=true]:transition-[transform,opacity] data-[active=true]:duration-[900ms] data-[active=true]:ease-[cubic-bezier(0.22,1,0.36,1)]",
].join(" ");

function SlideView({
  slide,
  active,
  priority,
}: {
  slide: HeroBannerSlide;
  active: boolean;
  priority: boolean;
}) {
  const { desktopMedia, mobileMedia } = slide;
  const hasText = Boolean(
    slide.kicker || slide.heading || slide.description || slide.cta,
  );

  return (
    <div
      data-active={active}
      aria-hidden={!active}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      className={cn(
        "absolute inset-0 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)]",
        active ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
      )}
    >
      {/* Gradient backdrop (fallback + tone) */}
      <div className={cn("absolute inset-0", slide.gradient ?? "bg-zinc-900")} />

      {/* Media — responsive. When both are present, the mobile media shows below
          the `lg` breakpoint and the desktop media at/above it. With only one,
          it shows everywhere. */}
      {desktopMedia && mobileMedia ? (
        <>
          <MediaLayer
            media={mobileMedia}
            alt={slide.alt}
            active={active}
            priority={priority}
            wrapperClassName="lg:hidden"
          />
          <MediaLayer
            media={desktopMedia}
            alt={slide.alt}
            active={active}
            priority={priority}
            wrapperClassName="hidden lg:block"
          />
        </>
      ) : desktopMedia ? (
        <MediaLayer
          media={desktopMedia}
          alt={slide.alt}
          active={active}
          priority={priority}
        />
      ) : mobileMedia ? (
        <MediaLayer
          media={mobileMedia}
          alt={slide.alt}
          active={active}
          priority={priority}
        />
      ) : null}

      {/* Dark overlay for text legibility — only when the slide has overlay copy. */}
      {hasText && (
        <div className="absolute inset-0 bg-gradient-to-tr from-black/65 via-black/20 to-transparent" />
      )}

      {/* Content — bottom-left */}
      {hasText && (
        <div className="absolute inset-x-0 bottom-0 z-10 px-6 sm:px-10 lg:px-14 pb-20 lg:pb-14">
          <div className="max-w-2xl">
            {slide.kicker && (
              <p
                data-active={active}
                className={cn(
                  TEXT_ENTRY,
                  "data-[active=true]:delay-[80ms]",
                  "text-[11px] font-medium uppercase tracking-[0.28em] text-white/85 sm:text-xs",
                )}
              >
                {slide.kicker}
              </p>
            )}
            {slide.heading && (
              <h1
                data-active={active}
                className={cn(
                  TEXT_ENTRY,
                  "data-[active=true]:delay-[180ms]",
                  "mt-5 text-3xl font-normal leading-[1.02] lg:tracking-[-0.015em] text-white sm:text-5xl lg:text-[4rem] lg:leading-[0.98]",
                )}
              >
                {slide.heading}
              </h1>
            )}
            {slide.description && (
              <p
                data-active={active}
                className={cn(
                  TEXT_ENTRY,
                  "data-[active=true]:delay-[300ms]",
                  "mt-5 max-w-xl text-sm font-normal leading-relaxed text-white/85 sm:text-lg",
                )}
              >
                {slide.description}
              </p>
            )}
            {slide.cta && (
              <div
                data-active={active}
                className={cn(
                  TEXT_ENTRY,
                  "data-[active=true]:delay-[420ms]",
                  "mt-9",
                )}
              >
                <Link
                  href={slide.cta.href as Route}
                  tabIndex={active ? 0 : -1}
                  className="group/cta inline-flex items-center gap-2.5 bg-white px-7 py-3.5 text-sm font-medium tracking-tight text-zinc-950 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.6)] transition-all duration-200 hover:gap-3.5 hover:bg-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  {slide.cta.label}
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MediaLayer({
  media,
  alt,
  active,
  priority,
  wrapperClassName,
}: {
  media: HeroMedia;
  alt: string;
  active: boolean;
  priority: boolean;
  wrapperClassName?: string;
}) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden", wrapperClassName)}>
      {media.type === "video" ? (
        <video
          src={media.url}
          className="size-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload={priority ? "auto" : "metadata"}
          aria-label={alt || undefined}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.url}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : "low"}
          data-active={active}
          className={cn(
            "size-full object-cover will-change-transform",
            "scale-[1.08] transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            "data-[active=true]:scale-100",
          )}
        />
      )}
    </div>
  );
}
