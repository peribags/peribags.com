import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { NewArrivalCard } from "@/lib/new-arrivals";
import { cn } from "@/lib/utils";

export type ProductShowcaseProps = {
  /** Small uppercase text above the heading. */
  kicker?: string;
  /** Section heading. */
  heading: string;
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

  return (
    <section style={background ? { backgroundColor: background } : undefined}>
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        <div className="mx-auto max-w-2xl text-center">
          {kicker && (
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              {kicker}
            </p>
          )}
          <h2
            className={cn(
              "text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl",
              kicker && "mt-2",
            )}
          >
            {heading}
          </h2>
          {description && (
            <p className="mt-4 text-sm text-zinc-600 sm:text-base">{description}</p>
          )}
        </div>

        {/* Grid — 2 col mobile, 4 col desktop */}
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 lg:mt-16 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-16">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {/* Optional View all CTA */}
        {viewAllHref && (
          <div className="mt-12 flex justify-center lg:mt-16">
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

function ProductCard({ product }: { product: NewArrivalCard }) {
  const inStock = product.inStock ?? true;

  return (
    <Link href={product.href} className="group/card block">
      {/* Image — cream tile frames the (often white-bg) product photo */}
      <div
        className="relative aspect-[3/4.25] overflow-hidden"
        style={{ backgroundColor: "#F5F1EA" }}
      >
        {product.imageUrl ? (
          // Padded centered container — product floats inside the cream frame.
          <div className="absolute inset-0 grid place-items-center ">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              // src={product.imageUrl}
              src={"/product.jpg"}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className={cn(
                "max-h-full max-w-full object-contain transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]",
                !inStock && "opacity-70",
              )}
            />
          </div>
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-400">
            <ImageIcon className="size-8" aria-hidden />
          </div>
        )}

        {/* Top-left tag */}
        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em]",
            inStock ? "bg-zinc-950 text-white" : "bg-white text-zinc-900",
          )}
        >
          {inStock ? "New" : "Out of stock"}
        </span>

        {/* Hover quick-look pill — desktop only */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden p-3 md:block">
          <div
            style={{
              transitionProperty: "opacity, translate",
              transitionDuration: "400ms",
              transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            className="translate-y-3 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100"
          >
            <div className="flex items-center justify-between bg-white/95 px-3.5 py-2.5 backdrop-blur">
              <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-950">
                View product
              </span>
              <ArrowUpRight className="size-3.5 text-zinc-950" />
            </div>
          </div>
        </div>
      </div>

      {/* Name — centered with underline-grow on hover (md+) */}
      <div className="mt-5 text-center">
        <h3 className="text-sm font-normal tracking-tight text-zinc-950 sm:text-base">
          <span
            className={cn(
              "relative inline-block",
              "md:after:absolute md:after:inset-x-0 md:after:-bottom-0.5 md:after:h-px md:after:origin-center md:after:scale-x-0 md:after:bg-zinc-950 md:after:transition-transform md:after:duration-500 md:after:ease-out md:after:content-['']",
              "md:group-hover/card:after:scale-x-100",
            )}
          >
            {product.name}
          </span>
        </h3>
      </div>
    </Link>
  );
}
