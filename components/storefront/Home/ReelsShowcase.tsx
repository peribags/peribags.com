"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReelItem = {
  id: string;
  /** Resolved public video URL. */
  videoUrl: string;
  /** Resolved poster image URL. */
  posterUrl?: string;
  title?: string;
  caption?: string;
  /** Promotion link (internal path or full URL). */
  promoHref?: string;
  promoLabel?: string;
};

export type ReelsShowcaseProps = {
  reels: ReelItem[];
  kicker?: string;
  heading?: string;
  description?: string;
};

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function ReelsShowcase({
  reels,
  kicker,
  heading,
  description,
}: ReelsShowcaseProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      loop: true,
      containScroll: false,
      dragFree: false,
      slidesToScroll: 1,
    },
    [ClassNames({ snapped: "is-snapped" })],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Track which slide is centered.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi]);

  // Play only the centered video; pause + reset the others so they show their
  // first frame / poster as a "thumbnail".
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === selectedIndex) {
        v.muted = true;
        const p = v.play();
        if (p && typeof p.catch === "function") p.catch(() => {});
      } else {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          /* some browsers throw before metadata loads */
        }
      }
    });
  }, [selectedIndex]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (i: number) => emblaApi?.scrollTo(i),
    [emblaApi],
  );

  if (reels.length === 0) return null;

  const hasHeader = Boolean(kicker || heading || description);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        {hasHeader && (
          <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
            {kicker && (
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                {kicker}
              </p>
            )}
            {heading && (
              <h2
                className={cn(
                  "text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl",
                  kicker && "mt-3",
                )}
              >
                {heading}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-sm text-zinc-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Center-scale styling. Outer slide stays at full layout size so
            Embla's measurements stay accurate; only the INNER element scales. */}
        <style>{`
          .perry-reel-slide { flex: 0 0 auto; }
          .perry-reel-inner {
            transform: scale(0.78);
            transform-origin: center center;
            opacity: 0.4;
            transition: transform 500ms cubic-bezier(0.22, 1, 0.36, 1),
                        opacity 500ms ease-out;
            will-change: transform, opacity;
            backface-visibility: hidden;
          }
          .perry-reel-slide.is-snapped .perry-reel-inner {
            transform: scale(1);
            opacity: 1;
          }
          /* Hide the play affordance on the active reel — it's playing. */
          .perry-reel-slide.is-snapped .perry-reel-play { opacity: 0; }
          /* Dim overlay only on non-active reels so the snapped one reads clean. */
          .perry-reel-slide.is-snapped .perry-reel-veil { opacity: 0; }
        `}</style>

        <div
          className={cn("relative", hasHeader ? "mt-14" : "mt-0")}
          data-aos="fade-up"
          data-aos-delay="120"
        >
          {/* Embla viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex items-center gap-4 lg:gap-6">
              {reels.map((reel, i) => (
                <ReelCard
                  key={`${reel.id}-${i}`}
                  reel={reel}
                  index={i}
                  isActive={i === selectedIndex}
                  onSelect={scrollTo}
                  registerRef={(el) => {
                    videoRefs.current[i] = el;
                  }}
                />
              ))}
            </div>
          </div>

          {/* Controls — floating left/right, vertically centered on the slider */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
            <div className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 lg:left-6">
              <SliderButton direction="prev" onClick={scrollPrev} />
            </div>
            <div className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 lg:right-6">
              <SliderButton direction="next" onClick={scrollNext} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReelCard({
  reel,
  index,
  isActive,
  onSelect,
  registerRef,
}: {
  reel: ReelItem;
  index: number;
  isActive: boolean;
  onSelect: (i: number) => void;
  registerRef: (el: HTMLVideoElement | null) => void;
}) {
  const hasMeta = Boolean(reel.title || reel.caption || reel.promoHref);
  // Without a poster, force the first frame to paint as a thumbnail.
  const videoSrc = reel.posterUrl ? reel.videoUrl : `${reel.videoUrl}#t=0.1`;

  return (
    <div
      className={cn(
        "perry-reel-slide group/reel relative block",
        "w-56 sm:w-60 md:w-64 lg:w-72",
      )}
    >
      <div className="perry-reel-inner relative rounded-lg aspect-[9/16] overflow-hidden bg-zinc-900">
        <video
          ref={registerRef}
          src={videoSrc}
          poster={reel.posterUrl}
          muted
          playsInline
          loop
          preload="metadata"
          disablePictureInPicture
          className="absolute inset-0 z-0 size-full object-cover"
        />

        {/* Dim veil — fades out on the centered reel */}
        <div className="perry-reel-veil pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/60 via-black/15 to-transparent transition-opacity duration-500" />

        {/* Full-area select button — centers/replays this reel */}
        <button
          type="button"
          onClick={() => onSelect(index)}
          aria-label={isActive ? "Active reel" : "Play this reel"}
          className="absolute inset-0 z-[2] cursor-pointer"
        />

        {/* Play affordance — hidden on the centered reel via .is-snapped */}
        <div className="perry-reel-play pointer-events-none absolute inset-0 z-[3] grid place-items-center transition-opacity duration-300">
          <div className="grid size-12 place-items-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm">
            <PlayIcon className="ml-0.5 size-5" />
          </div>
        </div>

        {/* Title / caption / promo — shown on the active reel */}
        {hasMeta && (
          <div
            className={cn(
              "absolute inset-x-0 bottom-0 z-[4] flex flex-col items-start gap-2 p-4 transition-opacity duration-500",
              isActive ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {reel.title && (
              <h3 className="pointer-events-none text-sm font-medium tracking-tight text-white drop-shadow sm:text-base">
                {reel.title}
              </h3>
            )}
            {reel.caption && (
              <p className="pointer-events-none line-clamp-2 text-xs text-white/85 drop-shadow">
                {reel.caption}
              </p>
            )}
            {reel.promoHref && (
              <a
                href={reel.promoHref}
                tabIndex={isActive ? 0 : -1}
                className="pointer-events-auto mt-0.5 inline-flex rounded-full items-center gap-1.5 bg-white px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-950 transition-colors hover:bg-zinc-100"
              >
                {reel.promoLabel || "Shop now"}
                <ArrowUpRight className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SliderButton({
  direction,
  onClick,
}: {
  direction: "prev" | "next";
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={direction === "prev" ? "Previous reel" : "Next reel"}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] transition-colors duration-200",
        "hover:border-zinc-900 hover:bg-zinc-950 hover:text-white",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}
