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
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/SkybagsNEXTRALAPTOPBACKPACK01_540x.png?v=1705658262",
    pricePaise: 499900,
  },
  {
    id: "city-sling",
    name: "City Sling",
    href: "/products/city-sling",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/LPBPVAN2BLK_1_540x.png?v=1701858512",
    pricePaise: 299900,
  },
  {
    id: "weekender",
    name: "The Weekender",
    href: "/products/weekender",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/LPBPCHSGRY_2_1800x1800_ddd169a4-4221-4c97-8b22-1281b9b9fce8_540x.png?v=1699961040",
    pricePaise: 749900,
  },
  {
    id: "minimalist-wallet",
    name: "Minimalist Wallet",
    href: "/products/minimalist-wallet",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/LPBPCHSGRY_2_1800x1800_ddd169a4-4221-4c97-8b22-1281b9b9fce8_540x.png?v=1699961040",
    pricePaise: 149900,
  },
  {
    id: "satchel",
    name: "Heritage Satchel",
    href: "/products/heritage-satchel",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/1_5_2973ffa8-0955-489e-82f1-2f851d1833a0_540x.png?v=1711552307",
    pricePaise: 599900,
  },
  {
    id: "card-holder",
    name: "Card Holder",
    href: "/products/card-holder",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/work5_540x.png?v=1693899583",
    pricePaise: 89900,
  },
  {
    id: "messenger",
    name: "Field Messenger",
    href: "/products/field-messenger",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/1_7_64042750-8893-4b36-b44f-b7f0338cf7f4_540x.png?v=1711552135",
    pricePaise: 649900,
    inStock: false,
  },
  {
    id: "backpack",
    name: "Daily Backpack",
    href: "/products/daily-backpack",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/1_7_64042750-8893-4b36-b44f-b7f0338cf7f4_540x.png?v=1711552135",
    pricePaise: 549900,
  },
  {
    id: "classic-tote",
    name: "Classic Leather Tote",
    href: "/products/classic-leather-tote",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/1_e4625668-807a-4e65-b21c-38fb10ee3d5f_1800x1800-removebg-preview_540x.png?v=1778665488",
    pricePaise: 499900,
  },
  {
    id: "city-sling",
    name: "City Sling",
    href: "/products/city-sling",
    imageUrl:
      "https://skybags.co.in/cdn/shop/files/1_6e1d2a67-f46e-4fc1-b6d4-8d402911a2fa_720x-removebg-preview_540x.png?v=1778665264",
    pricePaise: 299900,
  },
  
];
