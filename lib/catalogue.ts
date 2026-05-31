import type { Route } from "next";

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
// Mock product generator
// ─────────────────────────────────────────────────────────────────────────────

const namePrefixesBySlug: Record<string, string[]> = {
  totes: ["Classic", "Market", "Day", "Studio", "Carry", "Heritage", "Soft", "Mini"],
  slings: ["City", "Compact", "Atlas", "Daily", "Field", "Studio", "Ladies", "Pocket"],
  backpacks: ["Daily", "Atlas", "Voyager", "Studio", "Field", "Trail", "City", "Mini"],
  crossbody: ["Day", "Studio", "Compact", "Atlas", "Mini", "Soft", "Carry", "Ladies"],
  wallets: ["Bifold", "Card", "Long", "Pocket", "Notebook", "Slim", "Heritage", "Field"],
  clutches: ["Evening", "Envelope", "Studio", "Heritage", "Mini", "Structured", "Soft", "Ladies"],
  briefcases: ["Atlas", "Slim", "Studio", "Field", "Heritage", "Soft", "Day", "City"],
  travel: ["Weekender", "Duffel", "Voyager", "Field", "Atlas", "Studio", "City", "Heritage"],
};

const nameSuffixBySlug: Record<string, string> = {
  totes: "Tote",
  slings: "Sling",
  backpacks: "Pack",
  crossbody: "Crossbody",
  wallets: "Wallet",
  clutches: "Clutch",
  briefcases: "Brief",
  travel: "Carryall",
};

const imagePool = [
  "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=75",
  "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=75",
];

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

export function getCategoryProducts(slug: string): CatalogueProduct[] {
  const prefixes = namePrefixesBySlug[slug] ?? ["Style"];
  const suffix = nameSuffixBySlug[slug] ?? "";
  const subs = (subcategoriesBySlug[slug] ?? ["all"]).filter((s) => s !== "all");
  const total = 32; // a fuller catalogue so infinite scroll has something to do

  return Array.from({ length: total }, (_, i) => {
    const prefix = pick(prefixes, i);
    const variant = i >= prefixes.length ? ` 0${Math.floor(i / prefixes.length) + 1}` : "";
    return {
      id: `${slug}-${i + 1}`,
      name: `${prefix} ${suffix}${variant}`.trim(),
      href: `/products/${slug}-${i + 1}` as Route,
      imageUrl: pick(imagePool, i),
      pricePaise: 199900 + (i % 8) * 70000,
      inStock: i % 9 !== 0,
      subcategory: pick(subs, i),
      material: pick(materialOptions, i),
      colors: [pick(colorOptions, i).name, pick(colorOptions, i + 2).name],
    };
  });
}
