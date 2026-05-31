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
      "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=600&auto=format&fit=crop&q=75",
    pricePaise: 499900,
  },
  {
    id: "city-sling",
    name: "City Sling",
    href: "/products/city-sling",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=75",
    pricePaise: 299900,
  },
  {
    id: "weekender",
    name: "The Weekender",
    href: "/products/weekender",
    imageUrl:
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&auto=format&fit=crop&q=75",
    pricePaise: 749900,
  },
  {
    id: "minimalist-wallet",
    name: "Minimalist Wallet",
    href: "/products/minimalist-wallet",
    imageUrl:
      "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&auto=format&fit=crop&q=75",
    pricePaise: 149900,
  },
  {
    id: "satchel",
    name: "Heritage Satchel",
    href: "/products/heritage-satchel",
    imageUrl:
      "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&auto=format&fit=crop&q=75",
    pricePaise: 599900,
  },
  {
    id: "card-holder",
    name: "Card Holder",
    href: "/products/card-holder",
    imageUrl:
      "https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?w=600&auto=format&fit=crop&q=75",
    pricePaise: 89900,
  },
  {
    id: "messenger",
    name: "Field Messenger",
    href: "/products/field-messenger",
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=75",
    pricePaise: 649900,
    inStock: false,
  },
  {
    id: "backpack",
    name: "Daily Backpack",
    href: "/products/daily-backpack",
    imageUrl:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=75",
    pricePaise: 549900,
  },
  {
    id: "classic-tote",
    name: "Classic Leather Tote",
    href: "/products/classic-leather-tote",
    imageUrl:
      "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=600&auto=format&fit=crop&q=75",
    pricePaise: 499900,
  },
  {
    id: "city-sling",
    name: "City Sling",
    href: "/products/city-sling",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=75",
    pricePaise: 299900,
  },
  {
    id: "weekender",
    name: "The Weekender",
    href: "/products/weekender",
    imageUrl:
      "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=600&auto=format&fit=crop&q=75",
    pricePaise: 749900,
  },
  {
    id: "minimalist-wallet",
    name: "Minimalist Wallet",
    href: "/products/minimalist-wallet",
    imageUrl:
      "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&auto=format&fit=crop&q=75",
    pricePaise: 149900,
  },
];
