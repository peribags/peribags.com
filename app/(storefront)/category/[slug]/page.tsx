import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryListing from "@/components/storefront/Category/CategoryListing";
import { categoryTiles } from "@/lib/category-tiles";
import {
  categoryDescriptions,
  getCategoryProducts,
  subcategoriesBySlug,
} from "@/lib/catalogue";

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = categoryTiles.find((t) => t.id === slug);
  return {
    title: cat ? `${cat.name} | Perry Bags` : "Category | Perry Bags",
    description:
      categoryDescriptions[slug] ??
      `Shop ${cat?.name ?? "Perry Bags"} — premium leather, crafted to last.`,
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const category = categoryTiles.find((t) => t.id === slug);
  if (!category) notFound();

  const products = getCategoryProducts(slug);
  const subcategories = subcategoriesBySlug[slug] ?? ["all"];
  const description = categoryDescriptions[slug];

  return (
    <CategoryListing
      category={category}
      description={description}
      products={products}
      subcategories={subcategories}
    />
  );
}
