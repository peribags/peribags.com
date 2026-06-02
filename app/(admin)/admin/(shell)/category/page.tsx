import Link from "next/link";
import { FolderTree, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  countDescendants,
  listCategoryTree,
} from "@/lib/services/admin/categories.service";
import { r2PublicUrl } from "@/lib/r2";
import type { CategoryNode } from "@/types";
import { CategoryTree, type ClientTreeNode } from "./category-tree";
import { FlashToast } from "./flash-toast";

/** Convert a server CategoryNode to a client-safe shape with resolved image URLs. */
function toClientNode(node: CategoryNode): ClientTreeNode {
  return {
    id: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    imageSrc: node.imageUrl ? r2PublicUrl(node.imageUrl) : null,
    published: node.published,
    children: node.children.map(toClientNode),
  };
}

export const metadata = { title: "Categories" };

export default async function AdminCategoryPage() {
  const tree = await listCategoryTree();

  // Totals computed on the server so the page header doesn't depend on
  // expand state in the client tree.
  const rootCount = tree.length;
  const total = tree.reduce(
    (sum, n) => sum + 1 + countDescendants(n),
    0,
  );

  const { maxDepth, publishedCount } = walkTotals(tree);

  return (
    <div className="space-y-10">
      <FlashToast />

      {/* Page header */}
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            <FolderTree className="size-3" />
            Categories
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Category tree
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Build the hierarchy customers will browse on the storefront. Drag
            depth is unlimited; every node can hold its own children, image,
            and visibility setting.
          </p>
        </div>

        <Button asChild size="lg" className="self-start sm:self-end">
          <Link href="/admin/category/new">
            <Plus className="size-4" />
            New category
          </Link>
        </Button>
      </header>

      {/* Stats strip */}
      {total > 0 && (
        <dl className="border-border bg-card divide-border grid grid-cols-2 divide-x overflow-hidden rounded-2xl border sm:grid-cols-4">
          <Stat label="Categories" value={total} />
          <Stat label="Root nodes" value={rootCount} />
          <Stat label="Max depth" value={maxDepth} />
          <Stat label="Published" value={`${publishedCount}/${total}`} />
        </dl>
      )}

      {/* Tree */}
      {total === 0 ? (
        <EmptyState />
      ) : (
        <CategoryTree tree={tree.map(toClientNode)} total={total} />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

type WalkNode = {
  published: boolean;
  children: WalkNode[];
};

function walkTotals(tree: WalkNode[]) {
  let maxDepth = 0;
  let publishedCount = 0;
  const walk = (nodes: WalkNode[], depth: number) => {
    if (nodes.length > 0) maxDepth = Math.max(maxDepth, depth + 1);
    for (const n of nodes) {
      if (n.published) publishedCount += 1;
      walk(n.children, depth + 1);
    }
  };
  walk(tree, 0);
  return { maxDepth, publishedCount };
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <dt className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-2xl font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function EmptyState() {
  return (
    <section className="border-border bg-card relative overflow-hidden rounded-3xl border">
      {/* Decorative grid backdrop */}
      <div
        aria-hidden
        className="text-border absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />
      <div className="relative grid place-items-center gap-6 px-6 py-20 text-center">
        <div className="border-border bg-background relative flex size-16 items-center justify-center rounded-2xl border shadow-sm">
          <FolderTree className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            No categories yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Start with broad sections like{" "}
            <span className="text-foreground/80 font-medium">Bags</span>,{" "}
            <span className="text-foreground/80 font-medium">Wallets</span>,{" "}
            <span className="text-foreground/80 font-medium">Belts</span>.
            Sub-categories can be added inside any node.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/category/new">
            <Plus className="size-4" />
            Create your first category
          </Link>
        </Button>
      </div>
    </section>
  );
}
