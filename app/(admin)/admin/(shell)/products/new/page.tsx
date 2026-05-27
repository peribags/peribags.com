import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  buildTree,
  flattenTree,
  listCategories,
} from "@/lib/services/admin/categories.service";
import { ProductForm, type CategoryChoice } from "../product-form";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
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

        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Catalogue · Products
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            New product
          </h1>
          <p className="text-muted-foreground text-sm">
            Add a bag, wallet, or accessory to your catalogue.
          </p>
        </div>
      </header>

      <ProductForm mode="create" categoryChoices={choices} />
    </div>
  );
}
