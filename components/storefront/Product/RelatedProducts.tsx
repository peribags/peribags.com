import Link from "next/link";
import { ArrowUpRight, ImageIcon } from "lucide-react";
import type { ProductDetail } from "@/lib/product-detail";
import { cn } from "@/lib/utils";

type Props = {
  products: ProductDetail[];
  heading?: string;
};

export default function RelatedProducts({
  products,
  heading = "You may also like",
}: Props) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        <div
          className="flex items-end justify-between gap-6 border-b border-zinc-200 pb-5"
          data-aos="fade-up"
        >
          <h2 className="text-2xl font-medium tracking-tight text-zinc-950 sm:text-3xl">
            {heading}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 lg:mt-12 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16">
          {products.map((p, i) => (
            <div
              key={p.id}
              data-aos="fade-up"
              data-aos-delay={(i % 4) * 50}
            >
              <RelatedCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedCard({ product }: { product: ProductDetail }) {
  const inStock = product.inStock;

  return (
    <Link href={product.href} className="group/card block">
      <div
        className="relative aspect-[3/4.25] overflow-hidden"
        style={{ backgroundColor: "#F5F1EA" }}
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

        <span
          className={cn(
            "absolute left-3 top-3 inline-flex items-center px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em]",
            inStock ? "bg-zinc-950 text-white" : "bg-white text-zinc-900",
          )}
        >
          {inStock ? "New" : "Out of stock"}
        </span>

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
