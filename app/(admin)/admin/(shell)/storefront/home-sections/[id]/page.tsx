import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getSection } from "@/lib/services/admin/home-sections.service";
import { ServiceError } from "@/lib/services/shared/errors";
import {
  loadCategoryOptions,
  loadProductOptions,
} from "../picker-options";
import { DeleteSectionButton } from "../delete-section-button";
import { SectionForm } from "../section-form";

export const metadata = { title: "Edit section" };

export default async function EditSectionPage({
  params,
}: PageProps<"/admin/storefront/home-sections/[id]">) {
  const { id } = await params;

  let section;
  try {
    section = await getSection(id);
  } catch (err) {
    if (err instanceof ServiceError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const [categoryOptions, productOptions] = await Promise.all([
    loadCategoryOptions(),
    loadProductOptions(),
  ]);

  const title =
    section.heading?.trim() ||
    section.kicker?.trim() ||
    (section.type === "category" ? "Category section" : "Product section");

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

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              <span>Storefront</span>
              <ChevronRight className="size-3" />
              <Link
                href="/admin/storefront/home-sections"
                className="hover:text-foreground transition-colors"
              >
                Home Sections
              </Link>
            </nav>

            <h1 className="text-foreground truncate text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {title}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <span className="bg-muted/70 text-foreground/80 rounded px-1.5 py-0.5 font-mono text-[11px] capitalize">
                {section.type}
              </span>
              <span aria-hidden>·</span>
              <span>
                {section.published ? (
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
            </div>
          </div>

          <DeleteSectionButton
            id={section.id}
            name={title}
            variant="destructive"
            className="self-start sm:self-end"
          />
        </div>
      </header>

      <SectionForm
        mode="edit"
        section={section}
        categoryOptions={categoryOptions}
        productOptions={productOptions}
      />
    </div>
  );
}
