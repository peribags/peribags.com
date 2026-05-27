import Link from "next/link";
import { ChevronRight, FolderTree, ImageIcon, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  countDescendants,
  flattenTreeWithLines,
  listCategoryTree,
} from "@/lib/services/admin/categories.service";
import { r2PublicUrl } from "@/lib/r2";
import { cn } from "@/lib/utils";
import { DeleteCategoryButton } from "./delete-category-button";
import { FlashToast } from "./flash-toast";

export const metadata = { title: "Categories" };

export default async function AdminCategoryPage() {
  const tree = await listCategoryTree();
  const rows = flattenTreeWithLines(tree);

  const total = rows.length;
  const rootCount = tree.length;
  const maxDepth = rows.reduce((m, r) => Math.max(m, r.depth + 1), 0);
  const publishedCount = rows.filter((r) => r.node.published).length;

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
        <dl className="border-border bg-card grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border sm:grid-cols-4">
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
        <section className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Hierarchy
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {total} {total === 1 ? "node" : "nodes"}
            </span>
          </div>
          <ul>
            {rows.map((row, i) => (
              <TreeRow
                key={row.node.id}
                row={row}
                isLast={i === rows.length - 1}
              />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
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

type Row = ReturnType<typeof flattenTreeWithLines>[number];

function TreeRow({ row, isLast }: { row: Row; isLast: boolean }) {
  const { node, depth, ancestorLines, isLastSibling } = row;
  const descendants = node.children.length
    ? node.children.reduce((n, c) => n + 1 + countDescendants(c), 0)
    : 0;

  return (
    <li
      className={cn(
        "group/row relative transition-colors hover:bg-accent/40",
        !isLast && "border-border border-b",
      )}
    >
      <div className="flex items-stretch gap-0">
        {/* Connector columns */}
        {depth > 0 && (
          <div className="flex shrink-0 self-stretch">
            {ancestorLines.map((draw, i) => (
              <div
                key={i}
                className={cn(
                  "relative w-6",
                  draw && "before:bg-border before:absolute before:inset-y-0 before:left-3 before:w-px",
                )}
              />
            ))}
            {/* L-connector for this row's own column */}
            <div className="relative w-6">
              {/* vertical */}
              <div
                className={cn(
                  "bg-border absolute left-3 top-0 w-px",
                  isLastSibling ? "h-1/2" : "h-full",
                )}
              />
              {/* horizontal arm */}
              <div className="bg-border absolute left-3 top-1/2 h-px w-3" />
            </div>
          </div>
        )}

        {/* Row content */}
        <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-3 pl-3">
          <Thumb node={node} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <Link
                href={`/admin/category/${node.id}`}
                className="text-foreground hover:text-foreground/80 truncate text-sm font-semibold leading-tight tracking-tight underline-offset-4 hover:underline"
              >
                {node.name}
              </Link>
              <code className="text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none">
                {node.slug}
              </code>
              {!node.published && (
                <span className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                  Draft
                </span>
              )}
              {descendants > 0 && (
                <span className="text-muted-foreground text-[11px]">
                  {descendants} {descendants === 1 ? "child" : "children"}
                </span>
              )}
            </div>
            {node.description && (
              <p className="text-muted-foreground mt-0.5 line-clamp-1 text-xs">
                {node.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8"
              title="Add a sub-category"
            >
              <Link href={`/admin/category/new?parent=${node.id}`}>
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Add child</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="h-8"
              title="Edit category"
            >
              <Link href={`/admin/category/${node.id}`}>
                <ChevronRight className="size-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </Link>
            </Button>
            <DeleteCategoryButton
              id={node.id}
              name={node.name}
              descendantCount={descendants}
              variant="icon"
            />
          </div>
        </div>
      </div>
    </li>
  );
}

function Thumb({ node }: { node: { imageUrl: string | null; name: string } }) {
  return (
    <div className="from-muted/40 to-muted relative size-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ring-1 ring-border/60">
      {node.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={r2PublicUrl(node.imageUrl)}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground/60 grid size-full place-items-center">
          <ImageIcon className="size-4" />
        </div>
      )}
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
