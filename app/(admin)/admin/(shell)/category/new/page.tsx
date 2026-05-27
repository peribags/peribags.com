import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  flattenTree,
  listCategoryTree,
} from "@/lib/services/admin/categories.service";
import { CategoryForm } from "../category-form";

export const metadata = { title: "New category" };

type SearchParams = Promise<{ parent?: string }>;

export default async function NewCategoryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { parent } = await searchParams;

  const tree = await listCategoryTree();
  const flat = flattenTree(tree);
  const parentOptions = flat.map(({ node, depth }) => ({
    id: node.id,
    label: `${"— ".repeat(depth)}${node.name}`,
  }));

  const parentNode = parent ? flat.find((f) => f.node.id === parent)?.node : null;

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

        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Catalogue · Categories
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            New category
          </h1>
          {parentNode ? (
            <p className="text-muted-foreground text-sm">
              Will be created under{" "}
              <span className="text-foreground font-medium">
                {parentNode.name}
              </span>
              .
            </p>
          ) : (
            <p className="text-muted-foreground text-sm">
              Will appear at the top level.
            </p>
          )}
        </div>
      </header>

      <CategoryForm
        mode="create"
        parentOptions={parentOptions}
        defaultParentId={parent ?? null}
      />
    </div>
  );
}
