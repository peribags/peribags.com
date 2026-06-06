import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
import type { NewArrivalCard } from "@/lib/new-arrivals";
import { ShowcaseProductCard } from "@/components/storefront/Product/ShowcaseProductCard";
import { cn } from "@/lib/utils";

export type ProductShowcaseProps = {
  /** Small uppercase text above the heading. */
  kicker?: string;
  /** Section heading. Optional — the header block is hidden when empty. */
  heading?: string;
  /** Optional paragraph below the heading. */
  description?: string;
  /** CSS background color (e.g. "#FAF7F1", "white"). Defaults to white. */
  background?: string;
  /** Products to render. */
  products: NewArrivalCard[];
  /** Cap the number of products shown. Default: all. */
  limit?: number;
  /** If provided, renders a centered "View all" CTA below the grid. */
  viewAllHref?: Route;
  viewAllLabel?: string;
};

export default function ProductShowcase({
  kicker,
  heading,
  description,
  background,
  products,
  limit,
  viewAllHref,
  viewAllLabel = "View all",
}: ProductShowcaseProps) {
  const items = limit != null ? products.slice(0, limit) : products;
  if (items.length === 0) return null;

  const hasHeader = Boolean(kicker || heading || description);

  return (
    <section style={background ? { backgroundColor: background } : undefined}>
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
                  kicker && "mt-2",
                )}
              >
                {heading}
              </h2>
            )}
            {description && (
              <p className="mt-2 text-sm text-zinc-600 sm:text-base">
                {description}
              </p>
            )}
          </div>
        )}

        {/* Grid — 2 col mobile, 4 col desktop */}
        <div
          className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-16",
            hasHeader ? "mt-12 lg:mt-16" : "mt-0",
          )}
        >
          {items.map((p, i) => (
            <div
              key={p.id}
              data-aos="fade-up"
              data-aos-delay={(i % 5) * 50}
            >
              <ShowcaseProductCard product={p} />
            </div>
          ))}
        </div>

        {/* Optional View all CTA */}
        {viewAllHref && (
          <div className="mt-12 flex justify-center lg:mt-16" data-aos="fade-up">
            <Link
              href={viewAllHref}
              className="group inline-flex items-center gap-2 border border-zinc-900 px-6 py-3 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:bg-zinc-950 hover:text-white"
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

