import "server-only";

import {
  buildTree,
  flattenTree,
  listCategories,
} from "@/lib/services/admin/categories.service";
import { listProducts } from "@/lib/services/admin/products.service";
import { r2PublicUrl } from "@/lib/r2";
import type { PickerOption } from "@/components/admin/ordered-picker";

export async function loadCategoryOptions(): Promise<PickerOption[]> {
  const flat = await listCategories();
  const tree = buildTree(flat);
  return flattenTree(tree).map(({ node, depth }) => ({
    id: node.id,
    label: `${"— ".repeat(depth)}${node.name}`,
    sublabel: node.slug,
  }));
}

export async function loadProductOptions(): Promise<PickerOption[]> {
  const { rows } = await listProducts({ page: 1, pageSize: 500 });
  return rows.map((p) => ({
    id: p.id,
    label: p.name,
    sublabel: p.slug,
    imageUrl: p.images[0] ? r2PublicUrl(p.images[0]) : undefined,
  }));
}
