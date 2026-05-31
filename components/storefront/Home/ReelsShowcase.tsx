"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Reel = {
  id: string;
  imageUrl: string;
  href: string;
  caption?: string;
};

const reels: Reel[] = [
  {
    id: "r1",
    imageUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=70",
    href: "#",
    caption: "Inside the workshop",
  },
  {
    id: "r2",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=70",
    href: "#",
    caption: "The City Sling",
  },
  {
    id: "r3",
    imageUrl:
      "https://images.unsplash.com/photo-1559563458-527698bf5295?w=700&auto=format&fit=crop&q=75",
    href: "#",
    caption: "Saddle-stitch close-up",
  },
  {
    id: "r4",
    imageUrl:
      "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=600&auto=format&fit=crop&q=70",
    href: "#",
    caption: "Tote on the move",
  },
  {
    id: "r5",
    imageUrl:
      "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&auto=format&fit=crop&q=70",
    href: "#",
    caption: "New material study",
  },
  {
    id: "r6",
    imageUrl:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=70",
    href: "#",
    caption: "Inside the workshop",
  },
  {
    id: "r7",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=70",
    href: "#",
    caption: "The City Sling",
  },
  {
    id: "r8",
    imageUrl:
      "https://images.unsplash.com/photo-1559563458-527698bf5295?w=700&auto=format&fit=crop&q=75",
    href: "#",
    caption: "Saddle-stitch close-up",
  },
];

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export default function ReelsShowcase() {
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

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            From the Workshop
          </p>
          <h2 className="mt-3 text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl">
            In motion.
          </h2>
          <p className="mt-4 text-sm text-zinc-600 sm:text-base">
            Short films and behind-the-scenes glimpses from our workshop.
          </p>
        </div>

        {/* Center-scale styling. The outer slide stays at its layout size so
            Embla's measurements stay accurate; only the INNER element scales,
            which keeps `getBoundingClientRect()` reporting the full slide width. */}
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
        `}</style>

        <div className="relative mt-14">
          {/* Embla viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex items-center gap-4 lg:gap-6">
              {reels.map((reel, i) => (
                <ReelCard
                  key={`${reel.id}-${i}`}
                  reel={reel}
                  priority={i === 0}
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

function ReelCard({ reel, priority }: { reel: Reel; priority?: boolean }) {
  return (
    <a
      href={reel.href}
      className={cn(
        "perry-reel-slide group/reel relative block",
        "w-56 sm:w-60 md:w-64 lg:w-72",
      )}
    >
      {/* Inner element receives the scale transform so the slide's
          layout box stays at its full size for Embla's measurements. */}
      <div className="perry-reel-inner relative aspect-[9/16] overflow-hidden bg-zinc-900">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={reel.imageUrl}
          alt={reel.caption ?? "Reel"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/reel:scale-[1.06]"
        />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Play affordance */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid size-12 place-items-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover/reel:scale-110 group-hover/reel:bg-white group-hover/reel:text-zinc-950">
            <PlayIcon className="ml-0.5 size-5" />
          </div>
        </div>

        {reel.caption && (
          <p className="absolute inset-x-3 bottom-3 text-xs font-medium tracking-tight text-white/90">
            {reel.caption}
          </p>
        )}
      </div>
    </a>
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
