import { listPublishedCategoryTree } from "@/lib/services/storefront/categories.service";
import { rootNodesToTiles } from "@/lib/category-tiles";
import { HeaderShell } from "./header-shell";

export async function StorefrontHeader() {
  const tree = await listPublishedCategoryTree();
  const tiles = rootNodesToTiles(tree);
  return <HeaderShell tiles={tiles} />;
}
