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
  stripHtml,
} from "@/lib/services/storefront/product-detail.service";
import { siteConfig } from "@/lib/site";

const SITE_URL = siteConfig.url.replace(/\/$/, "");

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return {
      title: `Product not found | ${siteConfig.name}`,
      robots: { index: false, follow: false },
    };
  }

  const title = product.metaTitle ?? `${product.name} | ${siteConfig.name}`;
  const plainDescription = stripHtml(product.description);
  const description =
    product.metaDescription ??
    product.shortDescription ??
    (plainDescription ? plainDescription.slice(0, 160) : null) ??
    `Shop ${product.name} from ${siteConfig.name}.`;
  const url = `${SITE_URL}/products/${product.slug}`;
  const image = product.imageUrl || undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: siteConfig.name,
      title,
      description,
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

export default async function ProductDetailPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(
    product.id,
    product.categoryIds,
    4,
  );

  const pageUrl = `${SITE_URL}/products/${product.slug}`;

  // ── JSON-LD ────────────────────────────────────────────────────────────────
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${SITE_URL}/category`,
      },
      ...(product.category
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: product.category.name,
              item: `${SITE_URL}/category/${product.category.slug}`,
            },
          ]
        : []),
      {
        "@type": "ListItem",
        position: product.category ? 4 : 3,
        name: product.name,
        item: pageUrl,
      },
    ],
  };

  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.metaDescription ??
      product.shortDescription ??
      stripHtml(product.description),
    sku: product.id,
    url: pageUrl,
    image: product.gallery.length > 0 ? product.gallery : undefined,
    brand: { "@type": "Brand", name: siteConfig.name },
    category: product.category?.name,
    offers: {
      "@type": "Offer",
      url: pageUrl,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      ...(product.pricePaise != null
        ? {
            price: (product.pricePaise / 100).toFixed(2),
            priceCurrency: "INR",
          }
        : {}),
    },
    additionalProperty: product.specs.map((s) => ({
      "@type": "PropertyValue",
      name: s.label,
      value: s.value,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />

      <section className="bg-white">
        <div className="mx-auto max-w-[1600px] px-4 pt-6 pb-12 md:px-6 md:pt-8 md:pb-16 lg:px-[4vw] lg:pt-10 lg:pb-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-zinc-500">
              <li>
                <Link href="/" className="hover:text-zinc-900">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-zinc-400" />
              </li>
              <li>
                <Link href="/category" className="hover:text-zinc-900">
                  Categories
                </Link>
              </li>
              {product.category && (
                <>
                  <li aria-hidden>
                    <ChevronRight className="size-3.5 text-zinc-400" />
                  </li>
                  <li>
                    <Link
                      href={`/category/${product.category.slug}` as never}
                      className="hover:text-zinc-900"
                    >
                      {product.category.name}
                    </Link>
                  </li>
                </>
              )}
              <li aria-hidden>
                <ChevronRight className="size-3.5 text-zinc-400" />
              </li>
              <li className="text-zinc-900">{product.name}</li>
            </ol>
          </nav>

          {/* Main two-column: gallery + (info + details) */}
          <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-x-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
            {/* Gallery — sticky on lg so it stays put while right column scrolls */}
            <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
              {product.gallery.length > 0 ? (
                <ProductGallery
                  images={product.gallery}
                  alt={product.name}
                />
              ) : (
                <div
                  className="aspect-[4/5] w-full"
                  style={{ backgroundColor: "#F5F1EA" }}
                />
              )}
            </div>

            {/* Right column: info + details accordion */}
            <div className="min-w-0">
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
