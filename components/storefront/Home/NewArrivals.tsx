import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import { newArrivals, type NewArrivalCard } from "@/lib/new-arrivals";
import { cn } from "@/lib/utils";

function formatINR(paise: number | null) {
  if (paise == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function NewArrivals() {
  if (newArrivals.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-[4vw] lg:py-[4vw]">
        {/* Section header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              New Arrivals
            </p>
            <h2 className="text-4xl font-normal leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl">
              Just in.
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-medium tracking-tight text-zinc-900 transition-all hover:gap-2 sm:self-end"
          >
            View all
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 lg:mt-16 lg:grid-cols-5 lg:gap-x-6 lg:gap-y-14">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: NewArrivalCard }) {
  const price = formatINR(product.pricePaise);
  const inStock = product.inStock ?? true;

  return (
    <Link href={product.href} className="group/card block">
      {/* Image — sharp corners, square */}
      <div className="relative aspect-4/5 overflow-hidden bg-zinc-100">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            // src={product.imageUrl}
            src={'/product.jpg'}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]",
              !inStock && "opacity-70",
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-zinc-400">
            <ImageIcon className="size-8" aria-hidden />
          </div>
        )}

        {!inStock && (
          <span className="absolute left-3 top-3 inline-flex items-center bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-900">
            Out of stock
          </span>
        )}
      </div>

      {/* Meta — name + price below image */}
      <div className="mt-4 flex items-start justify-between gap-3 sm:mt-5">
        <div className="min-w-0 space-y-1">
          <h3 className="truncate text-sm font-medium tracking-tight text-zinc-950 sm:text-base">
            {product.name}
          </h3>
          {price ? (
            <p className="text-sm tabular-nums text-zinc-600">{price}</p>
          ) : (
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
              Price on request
            </p>
          )}
        </div>
        <ArrowUpRight
          className="size-4 shrink-0 text-zinc-400 transition-all duration-300 ease-out group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-zinc-950"
          aria-hidden
        />
      </div>
    </Link>
  );
}
