"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, ImageIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DeleteCategoryButton } from "./delete-category-button";

/**
 * Client-friendly tree node. The server resolves `imageSrc` via `r2PublicUrl`
 * before passing it down so this component doesn't need to import server-only
 * R2 helpers.
 */
export type ClientTreeNode = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageSrc: string | null;
  published: boolean;
  children: ClientTreeNode[];
};

type Props = {
  tree: ClientTreeNode[];
  total: number;
};

function countDescendants(node: ClientTreeNode): number {
  let n = 0;
  for (const c of node.children) n += 1 + countDescendants(c);
  return n;
}

function collectExpandableIds(nodes: ClientTreeNode[]): string[] {
  const out: string[] = [];
  const walk = (arr: ClientTreeNode[]) => {
    for (const n of arr) {
      if (n.children.length > 0) {
        out.push(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return out;
}

export function CategoryTree({ tree, total }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const expandableIds = useMemo(() => collectExpandableIds(tree), [tree]);
  const allExpanded =
    expandableIds.length > 0 &&
    expandableIds.every((id) => expanded.has(id));

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const expandAll = () => setExpanded(new Set(expandableIds));
  const collapseAll = () => setExpanded(new Set());

  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-5 py-3">
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Hierarchy
        </span>
        <div className="flex items-center gap-2">
          {expandableIds.length > 0 && (
            <button
              type="button"
              onClick={allExpanded ? collapseAll : expandAll}
              className="text-muted-foreground hover:text-foreground text-[11px] font-medium underline-offset-4 hover:underline"
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
          <span
            aria-hidden
            className="bg-border hidden h-3 w-px sm:block"
          />
          <span className="text-muted-foreground text-xs tabular-nums">
            {total} {total === 1 ? "node" : "nodes"}
          </span>
        </div>
      </div>
      <ul>
        {tree.map((node, i) => (
          <TreeNode
            key={node.id}
            node={node}
            depth={0}
            isLastSibling={i === tree.length - 1}
            expandedSet={expanded}
            onToggle={toggle}
          />
        ))}
      </ul>
    </section>
  );
}

// ────────────────────────────────────────────────────────────────────────────

function TreeNode({
  node,
  depth,
  isLastSibling,
  expandedSet,
  onToggle,
}: {
  node: ClientTreeNode;
  depth: number;
  isLastSibling: boolean;
  expandedSet: Set<string>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isOpen = expandedSet.has(node.id);
  const descendants = hasChildren
    ? node.children.reduce((n, c) => n + 1 + countDescendants(c), 0)
    : 0;

  return (
    <li
      className={cn(
        "group/row relative",
        !isLastSibling && "border-border border-b",
      )}
    >
      <div
        className="hover:bg-accent/40 flex items-stretch transition-colors"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {/* Chevron toggle */}
        <button
          type="button"
          onClick={() => hasChildren && onToggle(node.id)}
          disabled={!hasChildren}
          aria-expanded={hasChildren ? isOpen : undefined}
          aria-label={
            hasChildren
              ? isOpen
                ? `Collapse ${node.name}`
                : `Expand ${node.name}`
              : undefined
          }
          className={cn(
            "ml-2 mr-1 mt-3 grid size-6 shrink-0 place-items-center rounded transition-colors",
            hasChildren
              ? "text-muted-foreground hover:bg-muted hover:text-foreground"
              : "cursor-default opacity-0",
          )}
        >
          <ChevronRight
            className={cn(
              "size-4 transition-transform duration-200",
              isOpen && "rotate-90",
            )}
          />
        </button>

        {/* Row body */}
        <div className="flex min-w-0 flex-1 items-center gap-3 py-3 pr-3">
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
                <span className="text-muted-foreground text-[11px] tabular-nums">
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

      {/* Children — only render when open */}
      {hasChildren && isOpen && (
        <ul className="border-border/60 relative ml-[26px] border-l">
          {node.children.map((child, i) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              isLastSibling={i === node.children.length - 1}
              expandedSet={expandedSet}
              onToggle={onToggle}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function Thumb({ node }: { node: ClientTreeNode }) {
  return (
    <div className="from-muted/40 to-muted ring-border/60 relative size-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ring-1">
      {node.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={node.imageSrc}
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
