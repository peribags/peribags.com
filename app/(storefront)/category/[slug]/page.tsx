import { notFound } from "next/navigation";
import type { Metadata } from "next";
import CategoryListing from "@/components/storefront/Category/CategoryListing";
import { listPublishedCategoryTree } from "@/lib/services/storefront/categories.service";
import { nodeToTile } from "@/lib/category-tiles";
import {
  categoryDescriptions,
  getCategoryProducts,
  subcategoriesBySlug,
} from "@/lib/catalogue";
import type { CategoryNode } from "@/types";

/** Find a node anywhere in the published tree by its slug. */
function findBySlug(tree: CategoryNode[], slug: string): CategoryNode | null {
  for (const node of tree) {
    if (node.slug === slug) return node;
    const child = findBySlug(node.children, slug);
    if (child) return child;
  }
  return null;
}

export async function generateMetadata({
  params,
}: PageProps<"/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tree = await listPublishedCategoryTree();
  const node = findBySlug(tree, slug);
  return {
    title: node ? `${node.name} | Perry Bags` : "Category | Perry Bags",
    description:
      node?.metaDescription ??
      node?.description ??
      categoryDescriptions[slug] ??
      `Shop ${node?.name ?? "Perry Bags"} — premium leather, crafted to last.`,
  };
}

export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;
  const tree = await listPublishedCategoryTree();
  const node = findBySlug(tree, slug);
  if (!node) notFound();

  const products = getCategoryProducts(slug);
  const subcategories = subcategoriesBySlug[slug] ?? ["all"];
  const description = node.description ?? categoryDescriptions[slug];

  return (
    <CategoryListing
      category={nodeToTile(node)}
      description={description ?? undefined}
      products={products}
      subcategories={subcategories}
    />
  );
}
