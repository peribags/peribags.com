export type Category = {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CategoryNode = Category & { children: CategoryNode[] };

export type CategoryCreateInput = {
  parentId?: string | null;
  slug: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export type CategoryUpdateInput = Partial<CategoryCreateInput>;

// ────────────────────────────────────────────────────────────────────────────

export type ProductSpec = {
  label: string;
  value: string;
};

/** One selectable value inside an option group, e.g. Color → "Red". */
export type ProductOptionValue = {
  name: string;
  /** Optional R2 key shown as an image swatch in the storefront selector. */
  swatchImage: string | null;
};

/** An option group defined on the product, e.g. "Color" or "Size". */
export type ProductOption = {
  name: string;
  values: ProductOptionValue[];
};

/** One COMBINATION of option values (Shopify-style), e.g. Red / S. */
export type ProductVariant = {
  id: string;
  productId: string;
  /** Value names aligned with the product's options order, e.g. ["Red","S"]. */
  optionValues: string[];
  /** Denormalised display title, e.g. "Red / S". */
  title: string;
  sku: string | null;
  /** Null → inherits the product price. */
  pricePaise: number | null;
  /** R2 keys. Empty → storefront uses the product gallery. */
  images: string[];
  inStock: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductVariantInput = {
  optionValues: string[];
  sku?: string | null;
  pricePaise?: number | null;
  images?: string[];
  inStock?: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  description: string;
  pricePaise: number | null;
  images: string[];
  specs: ProductSpec[];
  metaTitle: string | null;
  metaDescription: string | null;
  inStock: boolean;
  published: boolean;
  featured: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  categoryIds: string[];
  /** Option group definitions (Color, Size, …). */
  options: ProductOption[];
  /** Generated combinations of the option values. */
  variants: ProductVariant[];
};

export type ProductCreateInput = {
  slug: string;
  name: string;
  shortDescription?: string | null;
  description?: string;
  pricePaise?: number | null;
  images?: string[];
  specs?: ProductSpec[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  inStock?: boolean;
  published?: boolean;
  featured?: boolean;
  sortOrder?: number;
  categoryIds?: string[];
  options?: ProductOption[];
  variants?: ProductVariantInput[];
};

export type ProductUpdateInput = Partial<ProductCreateInput>;

// ────────────────────────────────────────────────────────────────────────────

export type EnquiryStatus = "new" | "responded" | "archived";

export type Enquiry = {
  id: string;
  productId: string | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  message: string;
  status: EnquiryStatus;
  sourceUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined on read.
  product?: { id: string; name: string; slug: string } | null;
};

export type EnquiryCreateInput = {
  productId?: string | null;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  message: string;
  sourceUrl?: string | null;
};

// ────────────────────────────────────────────────────────────────────────────

export type BannerMediaType = "image" | "video";

export type HomeBannerSlide = {
  id: string;
  /** Desktop / default media. */
  mediaType: BannerMediaType;
  /** R2 key for the slide image or video. Null renders a plain backdrop. */
  mediaUrl: string | null;
  /** Optional mobile override — replaces the desktop media on small screens. */
  mobileMediaType: BannerMediaType | null;
  mobileMediaUrl: string | null;
  alt: string | null;
  kicker: string | null;
  heading: string | null;
  description: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HomeBannerSlideCreateInput = {
  mediaType?: BannerMediaType;
  mediaUrl?: string | null;
  mobileMediaType?: BannerMediaType | null;
  mobileMediaUrl?: string | null;
  alt?: string | null;
  kicker?: string | null;
  heading?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export type HomeBannerSlideUpdateInput = Partial<HomeBannerSlideCreateInput>;

export type HomeBannerConfig = {
  /** CSS height for desktop, e.g. "640px" or "80vh". Null = default. */
  heightDesktop: string | null;
  /** CSS height for mobile. Null falls back to desktop, then the default. */
  heightMobile: string | null;
  updatedAt: string | null;
};

// ────────────────────────────────────────────────────────────────────────────

export type HomeSectionType = "category" | "product";
export type HomeSectionProductSource = "categories" | "manual";

export type HomeSection = {
  id: string;
  type: HomeSectionType;
  kicker: string | null;
  heading: string | null;
  description: string | null;
  /** Product sections only: CSS background colour for the band. */
  background: string | null;
  /** Product sections only: where the products come from. */
  productSource: HomeSectionProductSource;
  /** Optional cap on items rendered. */
  itemLimit: number | null;
  viewAllHref: string | null;
  viewAllLabel: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  /** Selected category ids, in display order. */
  categoryIds: string[];
  /** Hand-picked product ids, in display order. */
  productIds: string[];
};

export type HomeSectionCreateInput = {
  type: HomeSectionType;
  kicker?: string | null;
  heading?: string | null;
  description?: string | null;
  background?: string | null;
  productSource?: HomeSectionProductSource;
  itemLimit?: number | null;
  viewAllHref?: string | null;
  viewAllLabel?: string | null;
  sortOrder?: number;
  published?: boolean;
  categoryIds?: string[];
  productIds?: string[];
};

export type HomeSectionUpdateInput = Partial<HomeSectionCreateInput>;

// ────────────────────────────────────────────────────────────────────────────

export type HomeReel = {
  id: string;
  /** R2 key for the reel video. */
  videoUrl: string | null;
  /** R2 key for an optional poster image. */
  posterUrl: string | null;
  title: string | null;
  caption: string | null;
  promoHref: string | null;
  promoLabel: string | null;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HomeReelCreateInput = {
  videoUrl?: string | null;
  posterUrl?: string | null;
  title?: string | null;
  caption?: string | null;
  promoHref?: string | null;
  promoLabel?: string | null;
  sortOrder?: number;
  published?: boolean;
};

export type HomeReelUpdateInput = Partial<HomeReelCreateInput>;

export type HomeReelsConfig = {
  kicker: string | null;
  heading: string | null;
  description: string | null;
  updatedAt: string | null;
};

// ────────────────────────────────────────────────────────────────────────────

export type OurWorkItem = {
  id: string;
  name: string;
  /** R2 key for the brand logo. Null renders the name as a typographic wordmark. */
  logoUrl: string | null;
  /** R2 key for the product picture. */
  imageUrl: string;
  description: string;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OurWorkCreateInput = {
  name: string;
  logoUrl?: string | null;
  imageUrl: string;
  description?: string;
  sortOrder?: number;
  published?: boolean;
};

export type OurWorkUpdateInput = Partial<OurWorkCreateInput>;
