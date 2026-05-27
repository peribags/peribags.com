import { listPublishedCategoryTree } from "@/lib/services/storefront/categories.service";
import { HeaderShell } from "./header-shell";

export async function StorefrontHeader() {
  const categories = await listPublishedCategoryTree();
  return <HeaderShell categories={categories} />;
}
