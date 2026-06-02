import Link from "next/link";
import { Clapperboard, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getReelsConfig,
  listReels,
} from "@/lib/services/admin/home-reels.service";
import { r2PublicUrl } from "@/lib/r2";
import { FlashToast } from "./flash-toast";
import { ReelsBoard, type ReelSummary } from "./reels-board";
import { ReelsHeaderForm } from "./reels-header-form";

export const metadata = { title: "Reels" };

export default async function AdminReelsPage() {
  const [reels, config] = await Promise.all([listReels(), getReelsConfig()]);

  const total = reels.length;
  const publishedCount = reels.filter((r) => r.published).length;
  const promoCount = reels.filter((r) => r.promoHref).length;

  const summaries: ReelSummary[] = reels.map((r) => ({
    id: r.id,
    title: r.title?.trim() || "Untitled reel",
    posterUrl: r.posterUrl ? r2PublicUrl(r.posterUrl) : null,
    videoUrl: r.videoUrl ? r2PublicUrl(r.videoUrl) : null,
    hasPromo: Boolean(r.promoHref),
    published: r.published,
  }));

  return (
    <div className="space-y-10">
      <FlashToast />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            <Clapperboard className="size-3" />
            Storefront · Reels
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Reels
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Short videos shown in the homepage reels carousel. Each reel has a
            video, optional poster, title, caption, and a promotion link. Drag to
            reorder.
          </p>
        </div>

        <Button asChild size="lg" className="self-start sm:self-end">
          <Link href="/admin/storefront/reels/new">
            <Plus className="size-4" />
            New reel
          </Link>
        </Button>
      </header>

      <ReelsHeaderForm config={config} />

      {total > 0 && (
        <dl className="border-border bg-card grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border">
          <Stat label="Reels" value={total} />
          <Stat label="Published" value={`${publishedCount}/${total}`} />
          <Stat label="With promo" value={promoCount} />
        </dl>
      )}

      {total === 0 ? <EmptyState /> : <ReelsBoard reels={summaries} />}
    </div>
  );
}

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
          <Clapperboard className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            No reels yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Upload your first reel — a short portrait video, with an optional
            poster, caption, and a link to shop.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/storefront/reels/new">
            <Plus className="size-4" />
            Upload your first reel
          </Link>
        </Button>
      </div>
    </section>
  );
}
