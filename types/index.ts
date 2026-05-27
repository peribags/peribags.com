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
