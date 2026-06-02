import Link from "next/link";
import { LayoutTemplate, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listSections } from "@/lib/services/admin/home-sections.service";
import type { HomeSection } from "@/types";
import { FlashToast } from "./flash-toast";
import { SectionsBoard, type SectionSummary } from "./sections-board";

export const metadata = { title: "Home Sections" };

function sectionTitle(s: HomeSection): string {
  return (
    s.heading?.trim() ||
    s.kicker?.trim() ||
    (s.type === "category" ? "Category section" : "Product section")
  );
}

function sectionItemCount(s: HomeSection): number {
  if (s.type === "category") return s.categoryIds.length;
  return s.productSource === "manual"
    ? s.productIds.length
    : s.categoryIds.length;
}

export default async function AdminHomeSectionsPage() {
  const sections = await listSections();

  const total = sections.length;
  const publishedCount = sections.filter((s) => s.published).length;
  const categoryCount = sections.filter((s) => s.type === "category").length;
  const productCount = sections.filter((s) => s.type === "product").length;

  const summaries: SectionSummary[] = sections.map((s) => ({
    id: s.id,
    type: s.type,
    title: sectionTitle(s),
    itemCount: sectionItemCount(s),
    published: s.published,
  }));

  return (
    <div className="space-y-10">
      <FlashToast />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            <LayoutTemplate className="size-3" />
            Storefront · Home Sections
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Home sections
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Compose the homepage from category and product sections. Drag to
            reorder — the order here is the order on the storefront.
          </p>
        </div>

        <Button asChild size="lg" className="self-start sm:self-end">
          <Link href="/admin/storefront/home-sections/new">
            <Plus className="size-4" />
            New section
          </Link>
        </Button>
      </header>

      {total > 0 && (
        <dl className="border-border bg-card grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border">
          <Stat label="Sections" value={total} />
          <Stat label="Category" value={categoryCount} />
          <Stat label="Product" value={productCount} />
        </dl>
      )}

      {total === 0 ? (
        <EmptyState />
      ) : (
        <SectionsBoard sections={summaries} />
      )}

      {total > 0 && (
        <p className="text-muted-foreground text-xs">
          {publishedCount}/{total} published.
        </p>
      )}
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
          <LayoutTemplate className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            No sections yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Add a category or product section to start building the homepage.
            Until you do, the storefront shows its default layout.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/storefront/home-sections/new">
            <Plus className="size-4" />
            Create your first section
          </Link>
        </Button>
      </div>
    </section>
  );
}
