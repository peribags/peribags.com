import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import {
  buildTree,
  flattenTree,
  listCategories,
} from "@/lib/services/admin/categories.service";
import { getProduct } from "@/lib/services/admin/products.service";
import { ServiceError } from "@/lib/services/shared/errors";
import { DeleteProductButton } from "../delete-product-button";
import { ProductForm, type CategoryChoice } from "../product-form";

export const metadata = { title: "Edit product" };

function formatINR(paise: number | null) {
  if (paise == null) return "Price on request";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]">) {
  const { id } = await params;

  let product;
  try {
    product = await getProduct(id);
  } catch (err) {
    if (err instanceof ServiceError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const flat = await listCategories();
  const tree = buildTree(flat);
  const choices: CategoryChoice[] = flattenTree(tree).map(({ node, depth }) => ({
    id: node.id,
    name: node.name,
    depth,
  }));

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/admin/products"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to products
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              <span>Catalogue</span>
              <ChevronRight className="size-3" />
              <Link
                href="/admin/products"
                className="hover:text-foreground transition-colors"
              >
                Products
              </Link>
            </nav>

            <h1 className="text-foreground truncate text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {product.name}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <code className="bg-muted/70 text-foreground/80 rounded px-1.5 py-0.5 font-mono text-[11px]">
                {product.slug}
              </code>
              <span aria-hidden>·</span>
              <span className="text-foreground/80 font-semibold tabular-nums">
                {formatINR(product.pricePaise)}
              </span>
              <span aria-hidden>·</span>
              <span>
                {product.published ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Published
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-amber-500" />
                    Draft
                  </span>
                )}
              </span>
              {!product.inStock && (
                <>
                  <span aria-hidden>·</span>
                  <span className="text-red-700 dark:text-red-400">
                    Out of stock
                  </span>
                </>
              )}
            </div>
          </div>

          <DeleteProductButton
            id={product.id}
            name={product.name}
            variant="destructive"
            className="self-start sm:self-end"
          />
        </div>
      </header>

      <ProductForm
        mode="edit"
        product={product}
        categoryChoices={choices}
      />
    </div>
  );
}
