"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  images: string[];
  alt: string;
};

export default function ProductGallery({ images, alt }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const safeIndex = useCallback(
    (i: number) => ((i % images.length) + images.length) % images.length,
    [images.length],
  );

  const goPrev = useCallback(
    () => setActive((i) => safeIndex(i - 1)),
    [safeIndex],
  );
  const goNext = useCallback(
    () => setActive((i) => safeIndex(i + 1)),
    [safeIndex],
  );

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-[auto_1fr] md:gap-4">
      {/* ── Thumb column (md+) ────────────────────────────────────────────── */}
      <div className="order-2 hidden md:order-1 md:block">
        <ul className="flex max-h-[calc(100svh-12rem)] flex-col gap-2 overflow-y-auto pr-1">
          {images.map((src, i) => {
            const isActive = i === active;
            return (
              <li key={`${src}-${i}`}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "relative block aspect-4/5 w-16 overflow-hidden border-2 transition-colors lg:w-20",
                    isActive
                      ? "border-zinc-950"
                      : "border-transparent hover:border-zinc-300",
                  )}
                  style={{ backgroundColor: "#F5F1EA" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${alt} view ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-contain "
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ── Main viewer ───────────────────────────────────────────────────── */}
      <div className="order-1 min-w-0 md:order-2">
        {/* Mobile — Embla carousel */}
        <div className="md:hidden">
          <MobileCarousel
            images={images}
            alt={alt}
            active={active}
            onActiveChange={setActive}
            onOpen={() => setLightboxOpen(true)}
          />
        </div>

        {/* Desktop — single static main image */}
        <div className="relative hidden md:block">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            aria-label="Open image in lightbox"
            className="relative block aspect-[4/5] w-full overflow-hidden"
            style={{ backgroundColor: "#F5F1EA" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={active}
              src={images[active]}
              alt={`${alt} view ${active + 1}`}
              loading="eager"
              decoding="sync"
              fetchPriority="high"
              className="absolute inset-0 size-full cursor-zoom-in object-contain"
              style={{ animation: "perry-pg-fade 280ms ease-out" }}
            />
            <span className="absolute right-4 top-4 inline-flex items-center bg-white/90 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-900 backdrop-blur">
              {active + 1} / {images.length}
            </span>
          </button>

          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous image"
            className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] transition-colors hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next image"
            className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-900 shadow-[0_8px_24px_-12px_rgba(15,15,15,0.18)] transition-colors hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes perry-pg-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          alt={alt}
          index={active}
          onIndexChange={setActive}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mobile Embla carousel — full-width slides + dot indicators
// ─────────────────────────────────────────────────────────────────────────────

function MobileCarousel({
  images,
  alt,
  active,
  onActiveChange,
  onOpen,
}: {
  images: string[];
  alt: string;
  active: number;
  onActiveChange: (i: number) => void;
  onOpen: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    skipSnaps: false,
    startIndex: active,
  });

  // Embla → React state.
  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => onActiveChange(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onActiveChange]);

  // React state → Embla (e.g. dot click).
  useEffect(() => {
    if (!emblaApi) return;
    if (emblaApi.selectedScrollSnap() !== active) {
      emblaApi.scrollTo(active);
    }
  }, [active, emblaApi]);

  return (
    <div>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative shrink-0 grow-0 basis-full"
            >
              <button
                type="button"
                onClick={onOpen}
                aria-label="Open image in lightbox"
                className="relative block aspect-[4/5] w-full overflow-hidden"
                style={{ backgroundColor: "#F5F1EA" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={`${alt} view ${i + 1}`}
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding={i === 0 ? "sync" : "async"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                  draggable={false}
                  className="absolute inset-0 size-full cursor-zoom-in object-contain"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onActiveChange(i)}
            aria-label={`Go to image ${i + 1}`}
            aria-current={i === active}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === active ? "w-6 bg-zinc-950" : "w-1.5 bg-zinc-300",
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lightbox — fullscreen with zoom + pan
// ─────────────────────────────────────────────────────────────────────────────

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;
const DOUBLE_CLICK_ZOOM = 2.5;

function Lightbox({
  images,
  alt,
  index,
  onIndexChange,
  onClose,
}: {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const total = images.length;

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const dragRef = useRef<{
    startX: number;
    startY: number;
    panStartX: number;
    panStartY: number;
    pointerType: "mouse" | "touch";
  } | null>(null);
  const movedRef = useRef(false);

  // Pinch-zoom state — tracks the initial finger distance + zoom.
  const pinchRef = useRef<{ startDist: number; startZoom: number } | null>(null);

  const safeIndex = useCallback(
    (i: number) => ((i % total) + total) % total,
    [total],
  );

  const reset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const goPrev = useCallback(() => {
    onIndexChange(safeIndex(index - 1));
    reset();
  }, [onIndexChange, safeIndex, index, reset]);

  const goNext = useCallback(() => {
    onIndexChange(safeIndex(index + 1));
    reset();
  }, [onIndexChange, safeIndex, index, reset]);

  // Reset zoom whenever the image changes (e.g. from external thumbnail click).
  useEffect(() => {
    reset();
  }, [index, reset]);

  // Body scroll lock + keyboard.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "+" || e.key === "=") zoomIn();
      else if (e.key === "-" || e.key === "_") zoomOut();
      else if (e.key === "0") reset();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goPrev, goNext, zoomIn, zoomOut, reset]);

  // Mouse-wheel zoom.
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  // Mouse drag — pan only when zoomed in.
  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    movedRef.current = false;
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panStartX: pan.x,
      panStartY: pan.y,
      pointerType: "mouse",
    };
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) movedRef.current = true;
    setPan({
      x: dragRef.current.panStartX + dx,
      y: dragRef.current.panStartY + dy,
    });
  };

  const onMouseUp = () => {
    dragRef.current = null;
  };

  // Touch — single-finger pan when zoomed, swipe-navigate when at 1x, two-finger pinch zoom.
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      pinchRef.current = {
        startDist: Math.hypot(dx, dy),
        startZoom: zoom,
      };
      return;
    }
    if (e.touches.length !== 1) return;
    movedRef.current = false;
    dragRef.current = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      panStartX: pan.x,
      panStartY: pan.y,
      pointerType: "touch",
    };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / pinchRef.current.startDist;
      const next = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, pinchRef.current.startZoom * ratio),
      );
      setZoom(+next.toFixed(2));
      return;
    }
    if (!dragRef.current || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragRef.current.startX;
    const dy = e.touches[0].clientY - dragRef.current.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) movedRef.current = true;
    if (zoom > 1) {
      setPan({
        x: dragRef.current.panStartX + dx,
        y: dragRef.current.panStartY + dy,
      });
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (pinchRef.current) {
      pinchRef.current = null;
      if (zoom <= 1) setPan({ x: 0, y: 0 });
      dragRef.current = null;
      return;
    }
    if (!dragRef.current) return;
    // Swipe to navigate — only when at 1x.
    if (zoom === 1 && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - dragRef.current.startX;
      if (Math.abs(dx) > 50) {
        if (dx > 0) goPrev();
        else goNext();
      }
    }
    dragRef.current = null;
  };

  // Click → toggle zoom (1x ↔ DOUBLE_CLICK_ZOOM). Ignored if user dragged.
  const onImageClick = () => {
    if (movedRef.current) return;
    if (zoom > 1) reset();
    else setZoom(DOUBLE_CLICK_ZOOM);
  };

  const cursor =
    zoom > 1 ? (dragRef.current ? "cursor-grabbing" : "cursor-grab") : "cursor-zoom-in";

  // Portal to <body> so an ancestor's `transform` (used by AOS) doesn't
  // re-parent our `position: fixed` to the column container — which would
  // visually clip the lightbox inside the gallery layout.
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  if (!portalTarget) return null;

  const content = (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-zinc-950/95 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
    >
      {/* Top bar */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3 text-white md:px-6 md:py-4">
        <span className="text-xs font-medium uppercase tracking-[0.22em] tabular-nums">
          {String(index + 1).padStart(2, "0")} /{" "}
          {String(total).padStart(2, "0")}
        </span>

        {/* Zoom controls */}
        <div className="flex items-center gap-1.5">
          <ZoomBtn
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            label="Zoom out"
          >
            <Minus className="size-4" />
          </ZoomBtn>
          <button
            type="button"
            onClick={reset}
            className="min-w-[3.5rem] rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium tabular-nums text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-950"
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          <ZoomBtn
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            label="Zoom in"
          >
            <Plus className="size-4" />
          </ZoomBtn>

          <span className="mx-2 hidden h-5 w-px bg-white/15 sm:block" />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-10 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-950"
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        className={cn("relative flex-1 overflow-hidden select-none", cursor)}
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0 flex items-center justify-center px-4 py-4 md:px-16 md:py-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={index}
            src={images[index]}
            alt={`${alt} view ${index + 1}`}
            draggable={false}
            onClick={onImageClick}
            className="block object-contain will-change-transform"
            style={{
              maxHeight: "100%",
              maxWidth: "100%",
              width: "auto",
              height: "auto",
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
              transition: dragRef.current
                ? "none"
                : "transform 220ms cubic-bezier(0.22, 1, 0.36, 1)",
              transformOrigin: "center center",
              animation:
                zoom === 1 && pan.x === 0 && pan.y === 0
                  ? "perry-lb-fade 320ms ease-out"
                  : undefined,
            }}
          />
        </div>

        {/* Prev/Next — hidden when zoomed so pan isn't blocked */}
        {total > 1 && zoom === 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-950 md:left-6"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-3 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-white/25 text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-950 md:right-6"
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}

        {/* Helper hint — bottom centre */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center text-[10px] font-medium uppercase tracking-[0.22em] text-white/40 md:text-[11px]">
          <span className="hidden md:inline">
            Scroll or +/− to zoom · drag to pan · double-click to toggle
          </span>
          <span className="md:hidden">Pinch to zoom · swipe to browse</span>
        </div>
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="shrink-0 border-t border-white/10 px-4 py-3 md:px-6">
          <ul className="flex justify-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {images.map((src, i) => (
              <li key={`${src}-${i}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onIndexChange(i);
                    reset();
                  }}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    "relative block aspect-square w-14 overflow-hidden border-2 transition-colors md:w-16",
                    i === index
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100",
                  )}
                  style={{ backgroundColor: "#1f1f23" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${alt} thumbnail ${i + 1}`}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 size-full object-contain p-1.5"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style>{`
        @keyframes perry-lb-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </div>
  );

  return createPortal(content, portalTarget);
}

function ZoomBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-white/20 text-white transition-colors",
        disabled
          ? "cursor-not-allowed opacity-40"
          : "hover:border-white hover:bg-white hover:text-zinc-950",
      )}
    >
      {children}
    </button>
  );
}
