import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { ColorVariants } from "@/lib/color-swatches";
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
  /** Parsed colour variants. Render only when present. */
  colorVariants?: ColorVariants | null;
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
                "max-h-full max-w-full object-contain rounded-sm transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.06]",
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
        {
          !inStock && (
            <span
              className={cn(
                "absolute left-3 top-3 inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em]",
                "bg-white text-zinc-900",
              )}
            >
              Out of stock
            </span>
          )
        }

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

      {/* Name + colour swatches — left-aligned */}
      <div className=" text-left">
        {product.colorVariants && product.colorVariants.swatches.length > 0 && (
          <ColorSwatchRow variants={product.colorVariants} />
        )}
        <h3 className="mt-3 text-sm font-normal text-zinc-950 sm:text-base">
          {product.name}
        </h3>
      </div>
    </Link>
  );
}

function ColorSwatchRow({ variants }: { variants: ColorVariants }) {
  const { swatches, totalCount } = variants;
  const extra = Math.max(0, totalCount - swatches.length);
  return (
    <div className="mt-2 flex items-center gap-1.5">
      {swatches.map((s, i) =>
        s.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${s.name}-${i}`}
            src={s.imageUrl}
            alt={s.name}
            title={s.name}
            loading="lazy"
            decoding="async"
            width={16}
            height={16}
            className="inline-block size-8 lg:size-12 rounded-xs border border-zinc-300 object-cover"
          />
        ) : (
          <span
            key={`${s.name}-${i}`}
            title={s.name}
            aria-label={s.name}
            className="inline-block size-4 rounded-full border border-zinc-300 bg-zinc-100"
          />
        ),
      )}
      {extra > 0 && (
        <span className="ml-0.5 text-[10px] font-medium tracking-wide text-zinc-500">
          +{extra}
        </span>
      )}
    </div>
  );
}
