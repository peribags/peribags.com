import { notFound } from "next/navigation";
import { Suspense } from "react";
import type { Metadata } from "next";
import type { Route } from "next";
import CategoryListing from "@/components/storefront/Category/CategoryListing";
import CategoryListingSkeleton from "./loading";
import { getCategoryListingData } from "@/lib/services/storefront/products.service";
import { siteConfig } from "@/lib/site";

// Project-wide policy: no caching anywhere. Every request server-renders.
export const dynamic = "force-dynamic";

const SITE_URL = siteConfig.url.replace(/\/$/, "");

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryListingData(slug);

  if (!data) {
    return {
      title: `Category | ${siteConfig.name}`,
      robots: { index: false, follow: false },
    };
  }

  const { category } = data;
  const title = category.metaTitle ?? `${category.name} | ${siteConfig.name}`;
  const description =
    category.metaDescription ??
    category.description ??
    `Browse ${category.name} from ${siteConfig.name} — specifications, availability, and subcategory filters.`;
  const url = `${SITE_URL}/category/${slug}`;

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
      ...(category.imageUrl ? { images: [{ url: category.imageUrl }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(category.imageUrl ? { images: [category.imageUrl] } : {}),
    },
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const data = await getCategoryListingData(slug);
  if (!data) notFound();

  const { category, subcategories, products } = data;
  const pageUrl = `${SITE_URL}/category/${slug}`;

  // ── Structured data (JSON-LD) ────────────────────────────────────────────
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categories",
        item: `${SITE_URL}/category`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: category.name,
        item: pageUrl,
      },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: category.name,
    description: category.description ?? undefined,
    url: pageUrl,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}${p.href}`,
      item: {
        "@type": "Product",
        name: p.name,
        url: `${SITE_URL}${p.href}`,
        image: p.imageUrl || undefined,
        offers: {
          "@type": "Offer",
          availability: p.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          ...(p.pricePaise != null
            ? {
                price: (p.pricePaise / 100).toFixed(2),
                priceCurrency: "INR",
              }
            : {}),
          url: `${SITE_URL}${p.href}`,
        },
      },
    })),
  };

  return (
    <>
      {/* Server-rendered JSON-LD — crawlers see breadcrumbs + the product
          list as soon as the HTML reaches them. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <Suspense fallback={<CategoryListingSkeleton />}>
        <CategoryListing
          category={{
            id: category.id,
            name: category.name,
            href: `/category/${category.slug}` as Route,
            imageUrl: category.imageUrl ?? undefined,
          }}
          description={category.description ?? undefined}
          products={products}
          subcategories={subcategories.map((s) => ({
            slug: s.slug,
            name: s.name,
          }))}
        />
      </Suspense>
    </>
  );
}
