import type { Route } from "next";

export type CategoryTile = {
  id: string;
  name: string;
  href: Route;
  /** Path to image. Drop files at /public/categories/<id>.webp to populate. */
  imageUrl?: string;
  /** Small label above the name. */
  kicker?: string;
  /** Fallback gradient classes for when the image is missing. */
  gradient?: string;
};

// Static placeholder — swap to `listPublishedCategoryTree()` later and map
// root nodes (`node.parentId === null`) into this shape. Keep the list at 8
// for the 4×2 desktop grid; tweak to your real top-level categories.
export const categoryTiles: CategoryTile[] = [
  {
    id: "totes",
    name: "Totes",
    kicker: "Everyday",
    href: "/category/totes",
    imageUrl: "/categories/totes.webp",
    gradient: "bg-gradient-to-br from-stone-700 to-stone-900",
  },
  {
    id: "slings",
    name: "Sling Bags",
    kicker: "On the move",
    href: "/category/slings",
    imageUrl: "/categories/slings.webp",
    gradient: "bg-gradient-to-br from-amber-900 to-zinc-950",
  },
  {
    id: "backpacks",
    name: "Backpacks",
    kicker: "Carry more",
    href: "/category/backpacks",
    imageUrl: "/categories/backpacks.webp",
    gradient: "bg-gradient-to-br from-emerald-900 to-zinc-950",
  },
  {
    id: "crossbody",
    name: "Crossbody",
    kicker: "Hands-free",
    href: "/category/crossbody",
    imageUrl: "/categories/crossbody.webp",
    gradient: "bg-gradient-to-br from-rose-900 to-zinc-950",
  },
  {
    id: "wallets",
    name: "Wallets",
    kicker: "Essentials",
    href: "/category/wallets",
    imageUrl: "/categories/wallets.webp",
    gradient: "bg-gradient-to-br from-zinc-700 to-zinc-950",
  },
  {
    id: "clutches",
    name: "Clutches",
    kicker: "Occasion",
    href: "/category/clutches",
    imageUrl: "/categories/clutches.webp",
    gradient: "bg-gradient-to-br from-indigo-900 to-zinc-950",
  },
  {
    id: "briefcases",
    name: "Briefcases",
    kicker: "Work",
    href: "/category/briefcases",
    imageUrl: "/categories/briefcases.webp",
    gradient: "bg-gradient-to-br from-slate-700 to-slate-950",
  },
  {
    id: "travel",
    name: "Travel",
    kicker: "Journey",
    href: "/category/travel",
    imageUrl: "/categories/travel.webp",
    gradient: "bg-gradient-to-br from-stone-800 to-black",
  },
];
