import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";
import type {
  Category,
  CategoryCreateInput,
  CategoryNode,
  CategoryUpdateInput,
} from "@/types";

type CategoryRow = {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  description: string | null;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

function fromRow(row: CategoryRow): Category {
  return {
    id: row.id,
    parentId: row.parent_id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    metaTitle: row.meta_title,
    metaDescription: row.meta_description,
    sortOrder: row.sort_order,
    published: row.published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRow(input: CategoryCreateInput | CategoryUpdateInput) {
  const row: Record<string, unknown> = {};
  if (input.parentId !== undefined) row.parent_id = input.parentId;
  if (input.slug !== undefined) row.slug = input.slug;
  if (input.name !== undefined) row.name = input.name;
  if (input.description !== undefined) row.description = input.description;
  if (input.imageUrl !== undefined) row.image_url = input.imageUrl;
  if (input.metaTitle !== undefined) row.meta_title = input.metaTitle;
  if (input.metaDescription !== undefined)
    row.meta_description = input.metaDescription;
  if (input.sortOrder !== undefined) row.sort_order = input.sortOrder;
  if (input.published !== undefined) row.published = input.published;
  return row;
}

/**
 * Build a tree from a flat list. Each node gets a `children` array.
 * Children are sorted by sort_order, then name.
 */
export function buildTree(rows: Category[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));

  const roots: CategoryNode[] = [];
  rows.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId == null) {
      roots.push(node);
    } else {
      const parent = map.get(r.parentId);
      if (parent) parent.children.push(node);
      else roots.push(node); // orphan (parent missing) — surface at root
    }
  });

  const sortNodes = (arr: CategoryNode[]) => {
    arr.sort(
      (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
    );
    arr.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

/**
 * DFS flatten of a tree into an ordered list with depth.
 * Useful for rendering an indented flat table or a select dropdown.
 */
export function flattenTree(
  roots: CategoryNode[],
  depth = 0,
): Array<{ node: CategoryNode; depth: number }> {
  const out: Array<{ node: CategoryNode; depth: number }> = [];
  for (const root of roots) {
    out.push({ node: root, depth });
    out.push(...flattenTree(root.children, depth + 1));
  }
  return out;
}

/** Collect IDs in a node's subtree (inclusive). */
export function collectSubtreeIds(node: CategoryNode): string[] {
  const ids: string[] = [node.id];
  for (const c of node.children) ids.push(...collectSubtreeIds(c));
  return ids;
}

/** Count descendants of a node (not including itself). */
export function countDescendants(node: CategoryNode): number {
  let n = 0;
  for (const c of node.children) n += 1 + countDescendants(c);
  return n;
}

export type TreeRow = {
  node: CategoryNode;
  depth: number;
  /**
   * For each ancestor depth (0..depth-1), whether to draw a vertical
   * guide line through this row at that column. True when that ancestor
   * has further siblings below — false when it was the last child.
   */
  ancestorLines: boolean[];
  /** True when this node is the last child of its parent. */
  isLastSibling: boolean;
};

/** DFS-ordered rows with the info needed to draw tree connector lines. */
export function flattenTreeWithLines(roots: CategoryNode[]): TreeRow[] {
  const out: TreeRow[] = [];

  const walk = (
    nodes: CategoryNode[],
    depth: number,
    ancestorLines: boolean[],
  ) => {
    nodes.forEach((node, idx) => {
      const isLastSibling = idx === nodes.length - 1;
      out.push({ node, depth, ancestorLines, isLastSibling });
      if (node.children.length > 0) {
        walk(node.children, depth + 1, [...ancestorLines, !isLastSibling]);
      }
    });
  };

  walk(roots, 0, []);
  return out;
}

/**
 * Find the next available slug among siblings (rows sharing the same parent).
 * Tries `base`, then `base-2`, `base-3`, … until one is free.
 * Passes `excludeId` to ignore the row being updated.
 */
export async function uniqueSiblingSlug(
  base: string,
  parentId: string | null,
  excludeId?: string,
): Promise<string> {
  await requireAdmin();
  const supabase = await createClient();

  let candidate = base;
  let n = 1;
  // Cap iterations defensively.
  while (n < 200) {
    let q = supabase.from("categories").select("id").eq("slug", candidate);
    q = parentId == null ? q.is("parent_id", null) : q.eq("parent_id", parentId);
    if (excludeId) q = q.neq("id", excludeId);

    const { data, error } = await q.limit(1);
    if (error) throw new ServiceError(error.message, "DB_ERROR", error);
    if (!data || data.length === 0) return candidate;

    n += 1;
    candidate = `${base}-${n}`;
  }
  throw new ServiceError("Could not generate a unique slug", "CONFLICT");
}

// ────────────────────────────────────────────────────────────────────────────
// CRUD
// ────────────────────────────────────────────────────────────────────────────

export async function listCategories(): Promise<Category[]> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order")
    .order("name");

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return (data ?? []).map(fromRow);
}

export async function listCategoryTree(): Promise<CategoryNode[]> {
  const flat = await listCategories();
  return buildTree(flat);
}

export async function getCategory(id: string): Promise<Category> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  if (!data) throw new ServiceError("Category not found", "NOT_FOUND");
  return fromRow(data);
}

export async function createCategory(
  input: CategoryCreateInput,
): Promise<Category> {
  await requireAdmin();
  if (!input.slug || !input.name) {
    throw new ServiceError("slug and name are required", "VALIDATION");
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert(toRow(input))
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new ServiceError(
        "A sibling category already has this slug",
        "CONFLICT",
        error,
      );
    }
    throw new ServiceError(error.message, "DB_ERROR", error);
  }
  return fromRow(data);
}

export async function updateCategory(
  id: string,
  patch: CategoryUpdateInput,
): Promise<Category> {
  await requireAdmin();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update(toRow(patch))
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      throw new ServiceError(
        "A sibling category already has this slug",
        "CONFLICT",
        error,
      );
    }
    // Cycle prevention trigger raises a plain exception.
    if (/cycle/i.test(error.message)) {
      throw new ServiceError(
        "Cannot move a category under one of its own descendants",
        "VALIDATION",
        error,
      );
    }
    throw new ServiceError(error.message, "DB_ERROR", error);
  }
  if (!data) throw new ServiceError("Category not found", "NOT_FOUND");
  return fromRow(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
}
