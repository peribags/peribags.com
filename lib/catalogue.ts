import type { Route } from "next";
import { newArrivals } from "@/lib/new-arrivals";

export type CatalogueProduct = {
  id: string;
  name: string;
  href: Route;
  imageUrl: string;
  pricePaise: number | null;
  inStock?: boolean;
  /** Slug, matches subcategoriesBySlug values. */
  subcategory: string;
  material: string;
  colors: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Taxonomies
// ─────────────────────────────────────────────────────────────────────────────

export const subcategoriesBySlug: Record<string, string[]> = {
  totes: ["all", "leather", "canvas", "mini"],
  slings: ["all", "city", "compact", "ladies", "men"],
  backpacks: ["all", "daily", "travel", "laptop", "mini"],
  crossbody: ["all", "small", "structured", "ladies"],
  wallets: ["all", "bifold", "card-holder", "long"],
  clutches: ["all", "evening", "envelope", "structured"],
  briefcases: ["all", "slim", "structured", "soft"],
  travel: ["all", "weekender", "duffel", "trolley"],
};

export function subcategoryLabel(slug: string) {
  if (slug === "all") return "All";
  return slug
    .split("-")
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join(" ");
}

export const materialOptions = [
  "Full-grain Leather",
  "Pebbled Leather",
  "Canvas",
  "Denim",
  "Suede",
];

export const colorOptions: { name: string; hex: string }[] = [
  { name: "Tan", hex: "#C4956A" },
  { name: "Black", hex: "#0A0A0A" },
  { name: "Brown", hex: "#5C3A21" },
  { name: "Olive", hex: "#6B7B3F" },
  { name: "Burgundy", hex: "#7A2E2E" },
  { name: "Stone", hex: "#B8A89A" },
];

export type SortValue = "featured" | "newest" | "price-low" | "price-high";

export const sortOptions: { value: SortValue; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

export type PriceRange = {
  id: string;
  label: string;
  /** Min price (inclusive) in paise. */
  min: number;
  /** Max price (exclusive) in paise. `null` = no upper bound. */
  max: number | null;
};

export const priceRanges: PriceRange[] = [
  { id: "under-1500", label: "Under ₹1,500", min: 0, max: 150000 },
  { id: "1500-3000", label: "₹1,500 – ₹3,000", min: 150000, max: 300000 },
  { id: "3000-5000", label: "₹3,000 – ₹5,000", min: 300000, max: 500000 },
  { id: "5000-7500", label: "₹5,000 – ₹7,500", min: 500000, max: 750000 },
  { id: "above-7500", label: "Above ₹7,500", min: 750000, max: null },
];

// ─────────────────────────────────────────────────────────────────────────────
// Category copy
// ─────────────────────────────────────────────────────────────────────────────

export const categoryDescriptions: Record<string, string> = {
  totes:
    "Soft, structured, and quietly luxurious — totes that hold a laptop, a notebook, and the rest of the day.",
  slings:
    "Compact, hands-free silhouettes for everywhere you'd rather not carry a full bag.",
  backpacks:
    "Leather backpacks made for the everyday carry — built to hold what matters and outlast what doesn't.",
  crossbody:
    "Crossbody styles to take you from the studio to the street, hands always free.",
  wallets:
    "Slim, honest leather — folded, stitched, and finished by hand to age into something better.",
  clutches:
    "Quiet evening pieces — structured envelopes and softly draped silhouettes.",
  briefcases:
    "Briefcases that read as books carried under the arm. Slim, soft, considered.",
  travel:
    "Weekenders, duffels, and trolleys built for the long way home.",
};

// ─────────────────────────────────────────────────────────────────────────────
// Product source — same shop catalogue as the homepage ProductShowcase.
// Each newArrivals item is replicated and tagged with rotating attributes so
// the listing has enough variety to filter & paginate against.
// ─────────────────────────────────────────────────────────────────────────────

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function getCategoryProducts(slug: string): CatalogueProduct[] {
  const subs = (subcategoriesBySlug[slug] ?? ["all"]).filter((s) => s !== "all");
  const total = 24;
  const source = newArrivals.length > 0 ? newArrivals : [];

  return Array.from({ length: total }, (_, i) => {
    const src = pick(source, i);
    const variantNo = Math.floor(i / source.length);
    const variant = variantNo > 0 ? ` 0${variantNo + 1}` : "";

    return {
      id: `${slug}-${src.id}-${i + 1}`,
      name: `${src.name}${variant}`.trim(),
      href: `/products/${src.id}` as Route,
      imageUrl: src.imageUrl ?? "",
      pricePaise: src.pricePaise,
      inStock: src.inStock ?? i % 9 !== 0,
      subcategory: subs.length > 0 ? pick(subs, i) : "all",
      material: pick(materialOptions, i),
      colors: [pick(colorOptions, i).name, pick(colorOptions, i + 2).name],
    };
  });
}
