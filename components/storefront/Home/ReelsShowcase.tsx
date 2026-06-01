"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import ClassNames from "embla-carousel-class-names";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Reel = {
  id: number;
  videoUrl: string;
};

const reels: Reel[] = [
  {
    id: 1,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/f8848f7cc3014e34b1afa09b5c111f98.mp4",
  },
  {
    id: 2,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/34854670c5094add92c262e6fb1b97e8.mp4",
  },
  {
    id: 3,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/34df93aa735249bd8618679422eae3b9.mp4",
  },
  {
    id: 4,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/1786b9cbfda04aa6b42192523971e6fb.mp4",
  },
  {
    id: 5,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/dab6cababdf8467897f12f0d9c3ae496.mp4",
  },
  {
    id: 6,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/f8848f7cc3014e34b1afa09b5c111f98.mp4",
  },
  {
    id: 7,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/2e485134761e443588d248101885f141.mp4",
  },
  {
    id: 8,
    videoUrl:
      "https://cdn.shopify.com/videos/c/o/v/34854670c5094add92c262e6fb1b97e8.mp4",
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
  // first frame as a "thumbnail".
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

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
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
          className="relative mt-14"
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
  reel: Reel;
  index: number;
  isActive: boolean;
  onSelect: (i: number) => void;
  registerRef: (el: HTMLVideoElement | null) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={isActive ? "Active reel" : "Play this reel"}
      className={cn(
        "perry-reel-slide group/reel relative block cursor-pointer",
        "w-56 sm:w-60 md:w-64 lg:w-72",
      )}
    >
      <div className="perry-reel-inner relative rounded-lg aspect-[9/16] overflow-hidden bg-zinc-900">
        <video
          ref={registerRef}
          // #t=0.1 forces browsers to paint the first frame as a poster even
          // before play() — without it, Firefox shows a black box.
          src={`${reel.videoUrl}#t=0.1`}
          muted
          playsInline
          loop
          preload="metadata"
          disablePictureInPicture
          className="absolute inset-0 size-full object-cover"
        />

        {/* Dim veil — fades out on the centered reel */}
        <div className="perry-reel-veil pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent transition-opacity duration-500" />

        {/* Play affordance — hidden on the centered reel via .is-snapped */}
        <div className="perry-reel-play pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-300">
          <div className="grid size-12 place-items-center rounded-full border border-white/70 bg-white/10 text-white backdrop-blur-sm">
            <PlayIcon className="ml-0.5 size-5" />
          </div>
        </div>
      </div>
    </button>
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
