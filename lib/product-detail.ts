import type { Route } from "next";
import { newArrivals, type NewArrivalCard } from "@/lib/new-arrivals";

export type ProductFeature = {
  title: string;
  description: string;
};

export type ProductSpec = {
  label: string;
  value: string;
};

export type ProductDetail = {
  id: string;
  slug: string;
  name: string;
  href: Route;
  /** Main image (first in gallery). */
  imageUrl: string;
  /** Full gallery (4-6 shots). */
  gallery: string[];
  /** Short hook shown under the title. */
  tagline: string;
  /** Long-form description, ~2-4 paragraphs. */
  description: string[];
  /** Bullet list of selling points. */
  features: ProductFeature[];
  /** Spec table — material, dimensions, weight, finish, made in, etc. */
  specs: ProductSpec[];
  /** Care instructions. */
  care: string[];
  /** Available colours (name + hex). */
  colors: { name: string; hex: string }[];
  /** Category slug for breadcrumb back-link. */
  categorySlug: string;
  /** Category display label. */
  categoryName: string;
  /** Stock status. */
  inStock: boolean;
  /** Stock keeping unit / model number. */
  sku: string;
};

// ─────────────────────────────────────────────────────────────────────────────
// Static data — fleshes out each newArrivals entry with rich PDP content.
// ─────────────────────────────────────────────────────────────────────────────

const galleryPool = [
  "https://skybags.co.in/cdn/shop/files/SkybagsNEXTRALAPTOPBACKPACK01_540x.png?v=1705658262",
  "https://skybags.co.in/cdn/shop/files/LPBPVAN2BLK_1_540x.png?v=1701858512",
  "https://skybags.co.in/cdn/shop/files/LPBPCHSGRY_2_1800x1800_ddd169a4-4221-4c97-8b22-1281b9b9fce8_540x.png?v=1699961040",
  "https://skybags.co.in/cdn/shop/files/1_5_2973ffa8-0955-489e-82f1-2f851d1833a0_540x.png?v=1711552307",
  "https://skybags.co.in/cdn/shop/files/work5_540x.png?v=1693899583",
  "https://skybags.co.in/cdn/shop/files/1_7_64042750-8893-4b36-b44f-b7f0338cf7f4_540x.png?v=1711552135",
];

const defaultColors = [
  { name: "Tan", hex: "#C4956A" },
  { name: "Black", hex: "#0A0A0A" },
  { name: "Brown", hex: "#5C3A21" },
  { name: "Olive", hex: "#6B7B3F" },
];

const defaultFeatures: ProductFeature[] = [
  {
    title: "Full-grain leather",
    description:
      "Cut from selected hides, chosen for grain and depth — built to age, not wear out.",
  },
  {
    title: "Hand-stitched",
    description:
      "Saddle-stitched by hand at our workshop. Stronger and longer-lasting than machine seams.",
  },
  {
    title: "Solid brass hardware",
    description:
      "Cast brass fittings finished with a brushed antique tone — develops a soft patina with use.",
  },
  {
    title: "Lifetime repairs",
    description:
      "Bring it back any time. We'll restitch, recondition, and return it.",
  },
];

const defaultSpecs: ProductSpec[] = [
  { label: "Material", value: "Full-grain leather, cotton twill lining" },
  { label: "Hardware", value: "Solid brushed brass" },
  { label: "Dimensions", value: "32 × 28 × 12 cm" },
  { label: "Weight", value: "0.95 kg" },
  { label: "Finish", value: "Hand-rubbed beeswax" },
  { label: "Made in", value: "India" },
];

const defaultCare = [
  "Wipe clean with a soft, dry cloth. Avoid rubbing.",
  "For deeper marks, use a leather conditioner sparingly once every 6 months.",
  "Keep away from prolonged direct sunlight and heat sources.",
  "If wet, blot — don't rub — and air-dry away from radiators.",
];

const taglinesById: Record<string, string> = {
  "classic-tote":
    "A leather tote that holds a laptop, a notebook, and the rest of the day.",
  "city-sling":
    "Compact, hands-free, and quietly luxurious — for everywhere you'd rather not carry a full bag.",
  weekender:
    "Forty-eight hours, one bag. Built to outlast the trip — and the next one.",
  "minimalist-wallet":
    "Slim, honest leather. Folded, stitched, and finished by hand.",
  satchel:
    "An old-school silhouette, made the slow way — saddle-stitched with brass fittings.",
  "card-holder":
    "Six cards, two slots, no bulk. Pocket leather at its quietest.",
  messenger:
    "A field bag that reads as a book carried under the arm — soft, considered, built to last.",
  backpack:
    "Everyday carry, made for the long way home — leather, brass, and time.",
};

const descriptionsById: Record<string, string[]> = {
  "classic-tote": [
    "The Classic Leather Tote is our quiet workhorse — a bag designed for the rhythm of a working week. Cut from full-grain leather and stitched by hand at our workshop in India, it shapes to its owner over time, taking on the colour and character of the lives it carries.",
    "Inside, a single deep compartment holds a 14-inch laptop, a notebook, and the small things that follow you through the day. A discreet zipped pocket sits against the back panel for keys, cards, and a phone.",
    "Like everything we make, it's built to be repaired rather than replaced.",
  ],
  "city-sling": [
    "A compact crossbody pared back to what matters: clean lines, soft full-grain leather, and one strong adjustable strap. The City Sling sits close to the body — hands free, weight forward — for days that move quickly.",
    "Two interior compartments and a card slot keep the essentials where you can reach them without looking.",
  ],
  weekender: [
    "Built for forty-eight hours away. The Weekender takes a change of clothes, a wash bag, and a pair of shoes — and still slides under most overhead bins.",
    "Heavy-duty saddle stitching at the stress points; reinforced base panel; soft enough to fold flat when you arrive.",
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Lookups
// ─────────────────────────────────────────────────────────────────────────────

function inferCategory(name: string): { slug: string; label: string } {
  const lower = name.toLowerCase();
  if (lower.includes("tote")) return { slug: "totes", label: "Totes" };
  if (lower.includes("sling")) return { slug: "slings", label: "Slings" };
  if (lower.includes("wallet"))
    return { slug: "wallets", label: "Wallets" };
  if (lower.includes("card")) return { slug: "wallets", label: "Wallets" };
  if (lower.includes("messenger") || lower.includes("satchel"))
    return { slug: "crossbody", label: "Crossbody" };
  if (lower.includes("weekender") || lower.includes("duffel"))
    return { slug: "travel", label: "Travel" };
  if (lower.includes("backpack") || lower.includes("pack"))
    return { slug: "backpacks", label: "Backpacks" };
  return { slug: "totes", label: "Bags" };
}

function buildGallery(primary: string, index: number): string[] {
  // Always lead with the product's own image, then pad with rotating pool shots.
  const extras = [
    galleryPool[(index + 1) % galleryPool.length],
    galleryPool[(index + 2) % galleryPool.length],
    galleryPool[(index + 3) % galleryPool.length],
    galleryPool[(index + 4) % galleryPool.length],
  ].filter((g) => g !== primary);
  return [primary, ...extras].slice(0, 5);
}

function pickColours(index: number): ProductDetail["colors"] {
  // Each product gets 2-3 colours so the swatch row has variety.
  const start = index % defaultColors.length;
  return [
    defaultColors[start],
    defaultColors[(start + 1) % defaultColors.length],
    defaultColors[(start + 2) % defaultColors.length],
  ];
}

function toDetail(card: NewArrivalCard, index: number): ProductDetail {
  const cat = inferCategory(card.name);
  const tagline =
    taglinesById[card.id] ??
    "Cut, stitched, and finished by hand — built to age, not wear out.";
  const description =
    descriptionsById[card.id] ??
    [
      `The ${card.name} is part of our core collection — designed to be carried daily, repaired when it needs to be, and kept for the long run.`,
      "We work with full-grain leather chosen piece by piece for character, and finish every bag by hand at our workshop. Brass fittings, a clean interior, and one strong stitch line you can count on.",
    ];

  const gallery = buildGallery(card.imageUrl ?? galleryPool[index % galleryPool.length], index);

  return {
    id: `${card.id}-${index}`,
    slug: card.id,
    name: card.name,
    href: card.href,
    imageUrl: gallery[0],
    gallery,
    tagline,
    description,
    features: defaultFeatures,
    specs: defaultSpecs,
    care: defaultCare,
    colors: pickColours(index),
    categorySlug: cat.slug,
    categoryName: cat.label,
    inStock: card.inStock ?? true,
    sku: `PB-${card.id.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${String(
      (index + 1) * 7,
    ).padStart(3, "0")}`,
  };
}

const detailsBySlug: Record<string, ProductDetail> = (() => {
  const map: Record<string, ProductDetail> = {};
  newArrivals.forEach((card, i) => {
    // newArrivals has a few repeated ids (classic-tote, city-sling). Keep the
    // first occurrence as the canonical detail.
    if (!map[card.id]) map[card.id] = toDetail(card, i);
  });
  return map;
})();

export function getProductBySlug(slug: string): ProductDetail | null {
  return detailsBySlug[slug] ?? null;
}

export function getRelatedProducts(slug: string, limit = 4): ProductDetail[] {
  const current = detailsBySlug[slug];
  const all = Object.values(detailsBySlug).filter((p) => p.slug !== slug);
  if (!current) return all.slice(0, limit);

  // Prefer same category first, then fill with anything else.
  const sameCat = all.filter((p) => p.categorySlug === current.categorySlug);
  const rest = all.filter((p) => p.categorySlug !== current.categorySlug);
  return [...sameCat, ...rest].slice(0, limit);
}

export function allProductSlugs(): string[] {
  return Object.keys(detailsBySlug);
}
