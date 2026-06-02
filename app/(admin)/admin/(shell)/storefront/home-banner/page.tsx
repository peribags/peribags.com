import Link from "next/link";
import {
  ChevronRight,
  Film,
  GalleryHorizontalEnd,
  ImageIcon,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getBannerConfig,
  listBannerSlides,
} from "@/lib/services/admin/home-banner.service";
import { r2PublicUrl } from "@/lib/r2";
import { cn } from "@/lib/utils";
import type { HomeBannerSlide } from "@/types";
import { DeleteSlideButton } from "./delete-slide-button";
import { FlashToast } from "./flash-toast";
import { HeightForm } from "./height-form";

export const metadata = { title: "Home Banner" };

function slideLabel(s: HomeBannerSlide): string {
  return s.heading?.trim() || s.kicker?.trim() || "Untitled slide";
}

export default async function AdminHomeBannerPage() {
  const [slides, config] = await Promise.all([
    listBannerSlides(),
    getBannerConfig(),
  ]);

  const total = slides.length;
  const publishedCount = slides.filter((s) => s.published).length;
  const videoCount = slides.filter((s) => s.mediaType === "video").length;

  return (
    <div className="space-y-10">
      <FlashToast />

      {/* Page header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            <GalleryHorizontalEnd className="size-3" />
            Storefront · Home Banner
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Home banner
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            The hero carousel at the top of your homepage. Add slides with an
            image or video, set the banner height, and reorder them — every
            field is optional.
          </p>
        </div>

        <Button asChild size="lg" className="self-start sm:self-end">
          <Link href="/admin/storefront/home-banner/new">
            <Plus className="size-4" />
            New slide
          </Link>
        </Button>
      </header>

      {/* Height config */}
      <HeightForm
        heightDesktop={config.heightDesktop}
        heightMobile={config.heightMobile}
      />

      {/* Stats strip */}
      {total > 0 && (
        <dl className="border-border bg-card grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border">
          <Stat label="Slides" value={total} />
          <Stat label="Published" value={`${publishedCount}/${total}`} />
          <Stat label="Videos" value={videoCount} />
        </dl>
      )}

      {/* Slides list */}
      {total === 0 ? (
        <EmptyState />
      ) : (
        <section className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Slides
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {total} {total === 1 ? "slide" : "slides"}
            </span>
          </div>
          <ul>
            {slides.map((s, i) => (
              <li
                key={s.id}
                className={cn(
                  "group/row hover:bg-accent/40 transition-colors",
                  i < slides.length - 1 && "border-border border-b",
                )}
              >
                <div className="flex min-w-0 items-center gap-3 px-4 py-3">
                  <Thumb slide={s} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <Link
                        href={`/admin/storefront/home-banner/${s.id}`}
                        className="text-foreground hover:text-foreground/80 truncate text-sm font-semibold leading-tight tracking-tight underline-offset-4 hover:underline"
                      >
                        {slideLabel(s)}
                      </Link>
                      <Badge tone={s.mediaType === "video" ? "violet" : "slate"}>
                        {s.mediaType}
                      </Badge>
                      {!s.published && <Badge tone="amber">Draft</Badge>}
                    </div>
                    {s.description && (
                      <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                        {s.description}
                      </p>
                    )}
                  </div>

                  <div className="text-muted-foreground shrink-0 text-right text-[11px] tabular-nums">
                    #{s.sortOrder}
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="h-8"
                      title="Edit slide"
                    >
                      <Link href={`/admin/storefront/home-banner/${s.id}`}>
                        <ChevronRight className="size-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>
                    </Button>
                    <DeleteSlideButton id={s.id} name={slideLabel(s)} variant="icon" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <dt className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-2xl font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function Thumb({ slide }: { slide: HomeBannerSlide }) {
  const src = slide.mediaUrl ? r2PublicUrl(slide.mediaUrl) : null;
  return (
    <div className="from-muted/40 to-muted ring-border/60 relative h-12 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ring-1">
      {src ? (
        slide.mediaType === "video" ? (
          <video src={src} className="size-full object-cover" muted playsInline />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="size-full object-cover" />
        )
      ) : (
        <div className="text-muted-foreground/60 grid size-full place-items-center">
          {slide.mediaType === "video" ? (
            <Film className="size-4" />
          ) : (
            <ImageIcon className="size-4" />
          )}
        </div>
      )}
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "amber" | "violet" | "slate";
  children: React.ReactNode;
}) {
  const styles = {
    amber:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    violet:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    slate:
      "border-border/80 bg-muted/40 text-muted-foreground",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        styles,
      )}
    >
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <section className="border-border bg-card relative overflow-hidden rounded-3xl border">
      <div
        aria-hidden
        className="text-border absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />
      <div className="relative grid place-items-center gap-6 px-6 py-20 text-center">
        <div className="border-border bg-background relative flex size-16 items-center justify-center rounded-2xl border shadow-sm">
          <GalleryHorizontalEnd className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            No slides yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Add your first slide — upload an image or video and, optionally, a
            heading and a call-to-action button.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/storefront/home-banner/new">
            <Plus className="size-4" />
            Create your first slide
          </Link>
        </Button>
      </div>
    </section>
  );
}
