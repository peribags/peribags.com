import type { Route } from "next";

export type NewArrivalCard = {
  id: string;
  name: string;
  href: Route;
  /** Path to image. Drop files at /public/products/<id>.webp to populate. */
  imageUrl?: string;
  /** Price in paise (INR × 100). Null = "Price on request". */
  pricePaise: number | null;
  inStock?: boolean;
};

// Static placeholder — swap to `listNewArrivals()` later by mapping
// products (id, slug, name, images[0], pricePaise, inStock) into this shape.
export const newArrivals: NewArrivalCard[] = [
  {
    id: "classic-tote",
    name: "Classic Leather Tote",
    href: "/products/classic-leather-tote",
    imageUrl: "/products/classic-tote.webp",
    pricePaise: 499900,
  },
  {
    id: "city-sling",
    name: "City Sling",
    href: "/products/city-sling",
    imageUrl: "/products/city-sling.webp",
    pricePaise: 299900,
  },
  {
    id: "weekender",
    name: "The Weekender",
    href: "/products/weekender",
    imageUrl: "/products/weekender.webp",
    pricePaise: 749900,
  },
  {
    id: "minimalist-wallet",
    name: "Minimalist Wallet",
    href: "/products/minimalist-wallet",
    imageUrl: "/products/wallet.webp",
    pricePaise: 149900,
  },
  {
    id: "satchel",
    name: "Heritage Satchel",
    href: "/products/heritage-satchel",
    imageUrl: "/products/satchel.webp",
    pricePaise: 599900,
  },
  {
    id: "card-holder",
    name: "Card Holder",
    href: "/products/card-holder",
    imageUrl: "/products/card-holder.webp",
    pricePaise: 89900,
  },
  {
    id: "messenger",
    name: "Field Messenger",
    href: "/products/field-messenger",
    imageUrl: "/products/messenger.webp",
    pricePaise: 649900,
    inStock: false,
  },
  {
    id: "backpack",
    name: "Daily Backpack",
    href: "/products/daily-backpack",
    imageUrl: "/products/backpack.webp",
    pricePaise: 549900,
  },
];
