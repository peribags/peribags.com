import type { Route } from "next";
import { r2PublicUrl } from "@/lib/r2";
import type { CategoryNode } from "@/types";

/**
 * Display-only shape used by the storefront's category tiles (homepage slider,
 * /category index, mega menu, search results, etc). All tiles come from the
 * `categories` table — there is no static fallback here.
 */
export type CategoryTile = {
  id: string;
  name: string;
  href: Route;
  /** Public URL or `undefined` when the admin hasn't uploaded an image. */
  imageUrl?: string;
  /** Small label above the name. Currently unused by the admin schema; kept
   *  in the shape so consumers can opt-in later without a type churn. */
  kicker?: string;
};

/** Map one DB category node into the display tile shape used by the UI. */
export function nodeToTile(node: CategoryNode): CategoryTile {
  return {
    id: node.id,
    name: node.name,
    href: `/category/${node.slug}` as Route,
    imageUrl: node.imageUrl ? r2PublicUrl(node.imageUrl) : undefined,
  };
}

/** Map a published category tree's root nodes to display tiles. */
export function rootNodesToTiles(tree: CategoryNode[]): CategoryTile[] {
  return tree.map(nodeToTile);
}
