import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Minimal prop shape consumed by the showcase card. Both `NewArrivalCard`
 * (homepage) and `CatalogueProduct` (category listing) satisfy this — by
 * passing them in directly, the two surfaces always render the same card.
 */
export type ShowcaseProductCardItem = {
  href: Route;
  name: string;
  imageUrl?: string;
  inStock?: boolean;
};

export function ShowcaseProductCard({
  product,
}: {
  product: ShowcaseProductCardItem;
}) {
  const inStock = product.inStock ?? true;

  return (
    <Link href={product.href} className="group/card block">
      {/* Image — neutral tile frames the product photo */}
      <div
        className="relative aspect-[4/5] overflow-hidden"
        style={{ backgroundColor: "#DDDDDD" }}
      >
        {product.imageUrl ? (
          <div className="absolute inset-0 grid place-items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl}
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

      {/* Name — left-aligned */}
      <div className="mt-4 text-left">
        <h3 className="text-sm font-normal tracking-tight text-zinc-950 sm:text-base">
          {product.name}
        </h3>
      </div>
    </Link>
  );
}
