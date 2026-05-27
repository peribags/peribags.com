import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  buildTree,
  collectSubtreeIds,
  countDescendants,
  flattenTree,
  getCategory,
  listCategories,
} from "@/lib/services/admin/categories.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type { CategoryNode } from "@/types";
import { CategoryForm } from "../category-form";
import { DeleteCategoryButton } from "../delete-category-button";

export const metadata = { title: "Edit category" };

export default async function EditCategoryPage({
  params,
}: PageProps<"/admin/category/[id]">) {
  const { id } = await params;

  let category;
  try {
    category = await getCategory(id);
  } catch (err) {
    if (err instanceof ServiceError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const allFlat = await listCategories();
  const tree = buildTree(allFlat);
  const flat = flattenTree(tree);

  const selfNode = flat.find((f) => f.node.id === category.id)?.node;
  const excluded = selfNode
    ? new Set(collectSubtreeIds(selfNode))
    : new Set<string>([category.id]);

  const parentOptions = flat
    .filter(({ node }) => !excluded.has(node.id))
    .map(({ node, depth }) => ({
      id: node.id,
      label: `${"— ".repeat(depth)}${node.name}`,
    }));

  // Breadcrumb chain: root → … → self
  const chain = selfNode ? buildChain(tree, selfNode.id) : [];
  const descendantCount = selfNode ? countDescendants(selfNode) : 0;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-4">
        <Link
          href="/admin/category"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to categories
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3 min-w-0">
            {/* Breadcrumb */}
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              <span>Catalogue</span>
              <ChevronRight className="size-3" />
              <Link
                href="/admin/category"
                className="hover:text-foreground transition-colors"
              >
                Categories
              </Link>
              {chain.slice(0, -1).map((c) => (
                <span key={c.id} className="flex items-center gap-1">
                  <ChevronRight className="size-3" />
                  <span className="truncate">{c.name}</span>
                </span>
              ))}
            </nav>

            <h1 className="text-foreground truncate text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {category.name}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <code className="bg-muted/70 text-foreground/80 rounded px-1.5 py-0.5 font-mono text-[11px]">
                {category.slug}
              </code>
              <span aria-hidden>·</span>
              <span>
                {category.published ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Draft
                  </span>
                )}
              </span>
              {descendantCount > 0 && (
                <>
                  <span aria-hidden>·</span>
                  <span>
                    {descendantCount} nested{" "}
                    {descendantCount === 1 ? "category" : "categories"}
                  </span>
                </>
              )}
            </div>
          </div>

          <DeleteCategoryButton
            id={category.id}
            name={category.name}
            descendantCount={descendantCount}
            variant="destructive"
            className="self-start sm:self-end"
          />
        </div>
      </header>

      <CategoryForm
        mode="edit"
        category={category}
        parentOptions={parentOptions}
      />
    </div>
  );
}

function buildChain(roots: CategoryNode[], id: string): CategoryNode[] {
  for (const root of roots) {
    if (root.id === id) return [root];
    const sub = buildChain(root.children, id);
    if (sub.length) return [root, ...sub];
  }
  return [];
}
