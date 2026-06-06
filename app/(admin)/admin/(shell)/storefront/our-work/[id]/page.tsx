import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getOurWork } from "@/lib/services/admin/our-work.service";
import { ServiceError } from "@/lib/services/shared/errors";
import { DeleteOurWorkButton } from "../delete-button";
import { OurWorkForm } from "../our-work-form";

export const metadata = { title: "Edit work item" };

export default async function EditOurWorkPage({
  params,
}: PageProps<"/admin/storefront/our-work/[id]">) {
  const { id } = await params;

  let item;
  try {
    item = await getOurWork(id);
  } catch (err) {
    if (err instanceof ServiceError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const title = item.name?.trim() || "Untitled item";

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/admin/storefront/our-work"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to our work
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
                href="/admin/storefront/our-work"
                className="hover:text-foreground transition-colors"
              >
                Our Work
              </Link>
            </nav>

            <h1 className="text-foreground truncate text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {title}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <span>
                {item.published ? (
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

          <DeleteOurWorkButton
            id={item.id}
            name={title}
            variant="destructive"
            className="self-start sm:self-end"
          />
        </div>
      </header>

      <OurWorkForm mode="edit" item={item} />
    </div>
  );
}
