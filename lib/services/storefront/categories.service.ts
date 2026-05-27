import "server-only";

import { createClient } from "@/lib/supabase/server";
import { buildTree } from "@/lib/services/admin/categories.service";
import { ServiceError } from "@/lib/services/shared/errors";
import type { Category, CategoryNode } from "@/types";

type Row = {
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

function fromRow(r: Row): Category {
  return {
    id: r.id,
    parentId: r.parent_id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    imageUrl: r.image_url,
    metaTitle: r.meta_title,
    metaDescription: r.meta_description,
    sortOrder: r.sort_order,
    published: r.published,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

/**
 * Public-facing tree of published categories. Runs as the anon role under
 * the `categories_public_read` RLS policy, so we explicitly filter to
 * `published = true` rather than relying on a join-side filter.
 */
export async function listPublishedCategoryTree(): Promise<CategoryNode[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("published", true)
    .order("sort_order")
    .order("name");

  if (error) throw new ServiceError(error.message, "DB_ERROR", error);
  return buildTree((data ?? []).map((r) => fromRow(r as unknown as Row)));
}
