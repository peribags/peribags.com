import type { RelatedProduct } from "@/lib/services/storefront/product-detail.service";
import { ShowcaseProductCard } from "@/components/storefront/Product/ShowcaseProductCard";

type Props = {
  products: RelatedProduct[];
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
        <div className="flex items-end justify-between gap-6 border-b border-zinc-200 pb-5">
          <h2 className="text-2xl font-medium tracking-tight text-zinc-950 sm:text-3xl">
            {heading}
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-12 md:gap-x-4 lg:mt-12 lg:grid-cols-4 lg:gap-x-6">
          {products.map((p) => (
            <ShowcaseProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
