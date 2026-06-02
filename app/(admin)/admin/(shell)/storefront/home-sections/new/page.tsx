import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  loadCategoryOptions,
  loadProductOptions,
} from "../picker-options";
import { SectionForm } from "../section-form";

export const metadata = { title: "New section" };

export default async function NewSectionPage() {
  const [categoryOptions, productOptions] = await Promise.all([
    loadCategoryOptions(),
    loadProductOptions(),
  ]);

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/admin/storefront/home-sections"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to home sections
        </Link>

        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Storefront · Home Sections
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            New section
          </h1>
          <p className="text-muted-foreground text-sm">
            Add a category or product section to the homepage.
          </p>
        </div>
      </header>

      <SectionForm
        mode="create"
        categoryOptions={categoryOptions}
        productOptions={productOptions}
      />
    </div>
  );
}
