import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import ProductGallery from "@/components/storefront/Product/ProductGallery";
import ProductInfo from "@/components/storefront/Product/ProductInfo";
import ProductDetails from "@/components/storefront/Product/ProductDetails";
import RelatedProducts from "@/components/storefront/Product/RelatedProducts";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/product-detail";

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return { title: "Product not found | Perry Bags" };
  }
  return {
    title: `${product.name} | Perry Bags`,
    description: product.tagline,
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(slug, 4);

  return (
    <>
      <section className="bg-white">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16 lg:px-[4vw] lg:pt-10 lg:pb-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <li>
                <Link
                  href="/"
                  className="transition-colors hover:text-zinc-900"
                >
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-zinc-400" />
              </li>
              <li>
                <Link
                  href="/category"
                  className="transition-colors hover:text-zinc-900"
                >
                  Categories
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-zinc-400" />
              </li>
              <li>
                <Link
                  href={`/category/${product.categorySlug}` as never}
                  className="transition-colors hover:text-zinc-900"
                >
                  {product.categoryName}
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-zinc-400" />
              </li>
              <li className="text-zinc-900">{product.name}</li>
            </ol>
          </nav>

          {/* Main two-column: gallery + (info + details) */}
          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-x-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
            {/* Gallery — sticky on lg so it stays put while right column scrolls */}
            <div
              className="min-w-0 lg:sticky lg:top-6 lg:self-start"
              data-aos="fade-up"
            >
              <ProductGallery images={product.gallery} alt={product.name} />
            </div>

            {/* Right column: info + details accordion */}
            <div
              className="min-w-0"
              data-aos="fade-up"
              data-aos-delay="120"
            >
              <ProductInfo product={product} />

              <div className="mt-10">
                <ProductDetails product={product} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related products */}
      <RelatedProducts products={related} />
    </>
  );
}
