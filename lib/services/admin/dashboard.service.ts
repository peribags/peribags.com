import "server-only";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import { ServiceError } from "@/lib/services/shared/errors";

export type DashboardStats = {
  products: {
    total: number;
    published: number;
    drafts: number;
    featured: number;
    outOfStock: number;
  };
  categories: {
    total: number;
  };
  enquiries: {
    new: number;
    responded: number;
    archived: number;
    total: number;
  };
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const supabase = await createClient();

  const [
    productsTotal,
    productsPublished,
    productsFeatured,
    productsOutOfStock,
    categoriesTotal,
    enquiryStatuses,
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("featured", true),
    supabase
      .from("products")
      .select("*", { count: "exact", head: true })
      .eq("in_stock", false),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("enquiries").select("status"),
  ]);

  const errors = [
    productsTotal.error,
    productsPublished.error,
    productsFeatured.error,
    productsOutOfStock.error,
    categoriesTotal.error,
    enquiryStatuses.error,
  ].filter(Boolean);
  if (errors.length > 0) {
    throw new ServiceError(errors[0]!.message, "DB_ERROR", errors[0]);
  }

  const enquiryCounts = { new: 0, responded: 0, archived: 0 };
  for (const row of enquiryStatuses.data ?? []) {
    const s = (row as { status: string }).status;
    if (s === "new" || s === "responded" || s === "archived") {
      enquiryCounts[s] += 1;
    }
  }

  const total = productsTotal.count ?? 0;
  const published = productsPublished.count ?? 0;

  return {
    products: {
      total,
      published,
      drafts: Math.max(0, total - published),
      featured: productsFeatured.count ?? 0,
      outOfStock: productsOutOfStock.count ?? 0,
    },
    categories: {
      total: categoriesTotal.count ?? 0,
    },
    enquiries: {
      ...enquiryCounts,
      total:
        enquiryCounts.new + enquiryCounts.responded + enquiryCounts.archived,
    },
  };
}
