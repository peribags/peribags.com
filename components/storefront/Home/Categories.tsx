"use client";

import Link from "next/link";
import type { Route } from "next";
import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import AutoScroll from "embla-carousel-auto-scroll";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { type CategoryTile } from "@/lib/category-tiles";
import { cn } from "@/lib/utils";

export type CategoriesProps = {
  /** Small uppercase label above the heading. */
  kicker?: string;
  /** Section heading. */
  heading?: string;
  /** Optional paragraph under the heading. */
  description?: string;
  /** Category tiles to render. */
  tiles: CategoryTile[];
  /** Optional "view all" CTA. Hidden when not provided. */
  viewAllHref?: Route | null;
  viewAllLabel?: string;
};

export default function Categories({
  kicker,
  heading,
  description,
  tiles,
  viewAllHref,
  viewAllLabel = "View all categories",
}: CategoriesProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      dragFree: true,
    },
    [
      // Continuous marquee-style autoplay. Pauses on hover, keeps going after
      // drags / arrow clicks.
      AutoScroll({
        speed: 1,
        startDelay: 0,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
      }),
    ],
  );
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateBounds = useCallback((api: typeof emblaApi) => {
    if (!api) return;
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    updateBounds(emblaApi);
    emblaApi.on("select", updateBounds);
    emblaApi.on("reInit", updateBounds);
    return () => {
      emblaApi.off("select", updateBounds);
      emblaApi.off("reInit", updateBounds);
    };
  }, [emblaApi, updateBounds]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (tiles.length === 0) return null;

  const hasHeader = Boolean(kicker || heading || description);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        {hasHeader && (
          <div className="text-center" data-aos="fade-up">
            {kicker && (
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                {kicker}
              </p>
            )}
            {heading && (
              <h2
                className={cn(
                  "text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl",
                  kicker && "mt-2",
                )}
                data-aos="fade-up"
                data-aos-delay="80"
              >
                {heading}
              </h2>
            )}
            {description && (
              <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Tile widths defined in plain CSS for Embla slides. */}
        <style>{`
          .perry-cat-slide { flex: 0 0 calc(50% - 0.375rem); min-width: 0; }
          @media (min-width: 1024px) {
            .perry-cat-slide { flex-basis: calc(20% - 0.8rem); }
          }
        `}</style>

        <div
          className={cn("relative lg:mt-12", hasHeader ? "mt-10" : "mt-0")}
          data-aos="fade-up"
          data-aos-delay="160"
        >
          {/* Embla viewport */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex gap-3 lg:gap-4">
              {tiles.map((tile) => (
                <TileCard key={tile.id} tile={tile} />
              ))}
            </div>
          </div>

          {/* Slider controls */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0">
            <div className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 lg:left-0 lg:-translate-x-1/2">
              <SliderButton direction="prev" onClick={scrollPrev} disabled={!canPrev} />
            </div>
            <div className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 lg:right-0 lg:translate-x-1/2">
              <SliderButton direction="next" onClick={scrollNext} disabled={!canNext} />
            </div>
          </div>
        </div>

        {/* View all */}
        {viewAllHref && (
          <div className="mt-10 flex justify-center lg:mt-12" data-aos="fade-up">
            <Link
              href={viewAllHref}
              className="group inline-flex rounded-full items-center gap-2 border border-zinc-900 px-6 py-3 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:bg-zinc-950 hover:text-white"
            >
              {viewAllLabel}
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

function SliderButton({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous categories" : "Next categories"}
      className={cn(
        "grid size-11 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] transition-colors duration-200",
        "hover:border-zinc-900 hover:bg-zinc-950 hover:text-white",
        "disabled:cursor-not-allowed disabled:border-zinc-100 disabled:bg-white disabled:text-zinc-300",
        "disabled:hover:border-zinc-100 disabled:hover:bg-white disabled:hover:text-zinc-300",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

function TileCard({ tile }: { tile: CategoryTile }) {
  return (
    <Link href={tile.href} className="perry-cat-slide group/card block">
      <div className="relative aspect-[4/5.5] overflow-hidden rounded-md bg-zinc-100">
        {tile.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tile.imageUrl}
            alt={tile.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover md:transition-transform md:duration-[900ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.04]"
          />
        )}

        {/* Gradient overlay for legibility */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 via-transparent to-transparent"
        />

        {/* Text inside, bottom */}
        <div className="absolute inset-x-0 bottom-0 p-3 text-left md:p-4">
          {tile.kicker && (
            <p className="text-[10px] font-normal uppercase tracking-[0.22em] text-white/75">
              {tile.kicker}
            </p>
          )}
          <h3 className="mt-1 text-base font-normal text-white">
            <span
              className={cn(
                "relative inline-block",
                "md:after:absolute md:after:inset-x-0 md:after:-bottom-0.5 md:after:h-px md:after:origin-left md:after:scale-x-0 md:after:bg-white md:after:transition-transform md:after:duration-500 md:after:ease-out md:after:content-['']",
                "md:group-hover/card:after:scale-x-100",
              )}
            >
              {tile.name}
            </span>
          </h3>
        </div>
      </div>
    </Link>
  );
}
