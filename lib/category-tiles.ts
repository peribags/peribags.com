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
    id: "slings",
    name: "Sling Bags",
    kicker: "On the move",
    href: "/category/slings",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=70",
    gradient: "bg-gradient-to-br from-amber-900 to-zinc-950",
  },
  {
    id: "backpacks",
    name: "Backpacks",
    kicker: "Carry more",
    href: "/category/backpacks",
    imageUrl:
      "https://plus.unsplash.com/premium_photo-1679314408041-45d1a3c45dee?w=600&auto=format&fit=crop&q=70",
    gradient: "bg-gradient-to-br from-emerald-900 to-zinc-950",
  },
  // {
  //   id: "crossbody",
  //   name: "Crossbody",
  //   kicker: "Hands-free",
  //   href: "/category/crossbody",
  //   imageUrl:
  //     "https://images.unsplash.com/photo-1597358371607-5987dd7da3d6?w=600&auto=format&fit=crop&q=70",
  //   gradient: "bg-gradient-to-br from-rose-900 to-zinc-950",
  // },
  {
    id: "wallets",
    name: "Wallets",
    kicker: "Essentials",
    href: "/category/wallets",
    imageUrl:
      "https://images.unsplash.com/photo-1682031215004-161c99d5b225?w=600&auto=format&fit=crop&q=70",
    gradient: "bg-gradient-to-br from-zinc-700 to-zinc-950",
  },
  {
    id: "clutches",
    name: "Clutches",
    kicker: "Occasion",
    href: "/category/clutches",
    imageUrl:
      "https://images.unsplash.com/photo-1560155136-ca9fd0b25a4c?w=600&auto=format&fit=crop&q=70",
    gradient: "bg-gradient-to-br from-indigo-900 to-zinc-950",
  },
  {
    id: "totes",
    name: "Totes",
    kicker: "Everyday",
    href: "/category/totes",
    imageUrl:
      "https://images.unsplash.com/photo-1566150902887-9679ecc155ba?w=600&auto=format&fit=crop&q=70",
    gradient: "bg-gradient-to-br from-stone-700 to-stone-900",
  },
  // {
  //   id: "briefcases",
  //   name: "Briefcases",
  //   kicker: "Work",
  //   href: "/category/briefcases",
  //   imageUrl:
  //     "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=70",
  //   gradient: "bg-gradient-to-br from-slate-700 to-slate-950",
  // },
  // {
  //   id: "travel",
  //   name: "Travel",
  //   kicker: "Journey",
  //   href: "/category/travel",
  //   imageUrl:
  //     "https://images.unsplash.com/photo-1581605405669-fcdf81165afa?w=800&auto=format&fit=crop&q=70",
  //   gradient: "bg-gradient-to-br from-stone-800 to-black",
  // },
];


const cat = {
  site: "https://www.peribags.in/",
  source: "https://www.peribags.in/our-products.html",
  total_categories: 49,
  categories: [
    {
      name: "Sling Bag",
      url: "https://www.peribags.in/sling-bag.html",
      subcategories: [
        "Wander Wave Sling Bag",
        "Grace Glide Sling Bag",
        "Sojourn Style Slings",
        "Urban Haul Sling",
        "Moda Pack Sling Bag",
      ],
    },
    {
      name: "Ladies Sling Bag",
      url: "https://www.peribags.in/ladies-sling-bag.html",
      subcategories: [
        "Ladies Sling Bag",
        "Forever Young Sling Bag",
        "Pu Sling Bags",
        "Girls Sling Bag",
        "Sling Bag",
      ],
    },
    {
      name: "Ladies Purse",
      url: "https://www.peribags.in/ladies-purse.html",
      subcategories: [
        "Emerald Ladies Handbag",
        "Leather Ladies Hand Bag",
        "Peri Ladies Hand Bags",
        "classy denim handbag",
        "Peri ladies handbag",
      ],
    },
    {
      name: "Ladies Bag",
      url: "https://www.peribags.in/ladies-bag.html",
      subcategories: [
        "Ladies Shoulder Handbag",
        "cute Mini Handbag",
        "PERI LADIES HANDBAG",
        "Denim Tote Bags",
        "Milano Muse handbag",
      ],
    },
    {
      name: "Side Bag",
      url: "https://www.peribags.in/side-bag.html",
      subcategories: [
        "Foam Side Sling",
        "Royal Side Sling",
        "Side Sling Bag",
        "PERI SIDE BAG",
        "Shorty Side Sling",
      ],
    },
    {
      name: "Saree Cover",
      url: "https://www.peribags.in/saree-cover.html",
      subcategories: [
        "Saree Cover",
        "Saree Cover Bag",
        "Saree Packing Covers",
        "Single Saree Cover",
      ],
    },
    {
      name: "Storage Box",
      url: "https://www.peribags.in/storage-box.html",
      subcategories: [
        "Satchel Storage Box",
        "24 Grid Organizer",
        "15 Grid Organizer",
        "Plastic Storage Box",
        "Travelling Shoe Organizer",
      ],
    },
    {
      name: "Travel Bag",
      url: "https://www.peribags.in/travel-bag.html",
      subcategories: [
        "Travel Bags",
        "Cozy Travelling Bag",
        "Peri Travel Bags",
        "travelling bag",
        "Foldable Shopping Bag",
      ],
    },
    {
      name: "Mobile Sling Bag",
      url: "https://www.peribags.in/mobile-sling-bag.html",
      subcategories: [
        "Mobile Pouch Sling Bag",
        "Mobile Sling Bag",
        "Chic Mobile Sling",
      ],
    },
    {
      name: "Leather Wallet",
      url: "https://www.peribags.in/leather-wallet.html",
      subcategories: [
        "Divine Small Pouch",
        "Lady zig wallet",
        "Ladies Wallets",
      ],
    },
    {
      name: "Mobile Sling",
      url: "https://www.peribags.in/mobile-sling.html",
      subcategories: [
        "Mobile Sling Bag",
        "HANDFREE MOBILE SLING",
        "Mobile Sling Purse",
      ],
    },
    {
      name: "Ladies Wallet",
      url: "https://www.peribags.in/ladies-wallet.html",
      subcategories: [
        "Girls Hand Wallet",
        "Ladies Hand Wallet",
        "Peri Ladies Purse",
      ],
    },
    {
      name: "Ladies Hand Bag",
      url: "https://www.peribags.in/ladies-hand-bag.html",
      subcategories: ["Denim Hand Bags", "Ladies Handbag"],
    },
    {
      name: "Laptop Bag",
      url: "https://www.peribags.in/laptop-bag.html",
      subcategories: ["Laptop Bag", "Laptop Bags"],
    },
    {
      name: "Jewellery Box",
      url: "https://www.peribags.in/jewellery-box.html",
      subcategories: [
        "Jewellery Boxes",
        "Travel Jewellery Box",
        "jewellery box",
      ],
    },
    {
      name: "Waist Pouch",
      url: "https://www.peribags.in/waist-pouch.html",
      subcategories: [
        "Black Waist Bag",
        "WanderWaist Pouch",
        "SwiftBelt Waist Pouch",
      ],
    },
    {
      name: "Storage Bags",
      url: "https://www.peribags.in/storage-bags.html",
      subcategories: [
        "Travel Storage Bags",
        "Jeans Organizer",
        "12 Khana Oragnizer",
      ],
    },
    {
      name: "Wallet",
      url: "https://www.peribags.in/wallet.html",
      subcategories: ["Hand Purse Multi Chain", "Peri ladies wallet"],
    },
    {
      name: "Cross Body Bag",
      url: "https://www.peribags.in/cross-body-bag.html",
      subcategories: ["Cross Body Bag", "ATC CROSS BODY BAG"],
    },
    {
      name: "Hand Bag",
      url: "https://www.peribags.in/hand-bag.html",
      subcategories: ["STRIPES DENIM HAND BAG", "Small Ladies Handbag"],
    },
    {
      name: "Tiffin Bag",
      url: "https://www.peribags.in/tiffin-bag.html",
      subcategories: ["School Tiffin Bags", "Tiffin Box Bag"],
    },
    {
      name: "Cash Bag",
      url: "https://www.peribags.in/cash-bag.html",
      subcategories: ["Foam Cash Pouch", "Leather Messenger Bag"],
    },
    {
      name: "Pouch Bag",
      url: "https://www.peribags.in/pouch-bag.html",
      subcategories: ["Multi Purpose Pouch (Matty)", "Multi Purpose Pouch Bag"],
    },
    {
      name: "Mobile Pouch With Hook",
      url: "https://www.peribags.in/mobile-pouch-with-hook.html",
      subcategories: ["Belt Mobile Pouch", "Mobile Belt Pouch"],
    },
    {
      name: "Travel",
      url: "https://www.peribags.in/travel.html",
      subcategories: ["TRAVELLING BAG", "Wheel Travelling Bag"],
    },
    {
      name: "Kids School Bag",
      url: "https://www.peribags.in/kids-school-bag.html",
      subcategories: ["Baby Hug Bag", "Car Shape Backpack"],
    },
    {
      name: "Gift Bag",
      url: "https://www.peribags.in/gift-bag.html",
      subcategories: ["Metallic Gift Bag"],
    },
    {
      name: "Canvas Bags",
      url: "https://www.peribags.in/canvas-bags.html",
      subcategories: ["Canvas Messenger Bag"],
    },
    {
      name: "Printed Shopping Bag",
      url: "https://www.peribags.in/printed-shopping-bag.html",
      subcategories: ["Printed Shopping Bag"],
    },
    {
      name: "Ladies Hand Purse",
      url: "https://www.peribags.in/ladies-hand-purse.html",
      subcategories: ["Ladies Small Handbags"],
    },
    {
      name: "Denim Bag",
      url: "https://www.peribags.in/denim-bag.html",
      subcategories: ["Denim Sling Bags"],
    },
    {
      name: "Leather Cross Body Bags",
      url: "https://www.peribags.in/leather-cross-body-bags.html",
      subcategories: ["Cross Body Bag"],
    },
    {
      name: "Shaving Kit",
      url: "https://www.peribags.in/shaving-kit.html",
      subcategories: ["PERI SHAVING KIT"],
    },
    {
      name: "Arm Sling",
      url: "https://www.peribags.in/arm-sling.html",
      subcategories: ["Ladies Hand Purse"],
    },
    {
      name: "Mobile Pouch",
      url: "https://www.peribags.in/mobile-pouch.html",
      subcategories: ["Mobile Pouch Sling Bag"],
    },
    {
      name: "Men Chest Bag",
      url: "https://www.peribags.in/men-chest-bag.html",
      subcategories: ["Men Chest Bag"],
    },
    {
      name: "Jewelry Box",
      url: "https://www.peribags.in/jewelry-box.html",
      subcategories: ["Jewellery Boxes"],
    },
    {
      name: "Shopping Bag",
      url: "https://www.peribags.in/shopping-bag.html",
      subcategories: ["Shopping Bag"],
    },
    {
      name: "Mobile Phone Accessories",
      url: "https://www.peribags.in/mobile-phone-accessories.html",
      subcategories: ["Mobile Accessories"],
    },
    {
      name: "Saree Cover Bag",
      url: "https://www.peribags.in/saree-cover-bag.html",
      subcategories: ["Saree Storage Bag"],
    },
    {
      name: "Trolly Bag",
      url: "https://www.peribags.in/trolly-bag.html",
      subcategories: ["Travel Trolley Bag"],
    },
    {
      name: "Card Holder",
      url: "https://www.peribags.in/card-holder.html",
      subcategories: ["Card Holder"],
    },
    {
      name: "Folding Bags",
      url: "https://www.peribags.in/folding-bags.html",
      subcategories: ["Foldable Smiley Bag"],
    },
    {
      name: "Jewellery pouch",
      url: "https://www.peribags.in/jewellery-pouch.html",
      subcategories: ["Jewellery Pouches"],
    },
    {
      name: "School Bag",
      url: "https://www.peribags.in/school-bag.html",
      subcategories: ["School Bags"],
    },
    {
      name: "Men Sling Bag",
      url: "https://www.peribags.in/men-sling-bag.html",
      subcategories: ["Mens Sling Bags"],
    },
    {
      name: "Jute Bag",
      url: "https://www.peribags.in/jute-bag.html",
      subcategories: ["Pencil Bag", "Jute Bags"],
    },
    {
      name: "Pencil Case",
      url: "https://www.peribags.in/pencil-case.html",
      subcategories: ["Pencil Pouch"],
    },
    {
      name: "New Items",
      url: "https://www.peribags.in/new-items.html",
      subcategories: [
        "Labubu doll",
        "Kids Duffle Bag",
        "Happy Journey bus Bag",
      ],
    },
  ],
};