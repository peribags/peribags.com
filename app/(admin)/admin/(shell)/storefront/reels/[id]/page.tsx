import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { getReel } from "@/lib/services/admin/home-reels.service";
import { ServiceError } from "@/lib/services/shared/errors";
import { DeleteReelButton } from "../delete-reel-button";
import { ReelForm } from "../reel-form";

export const metadata = { title: "Edit reel" };

export default async function EditReelPage({
  params,
}: PageProps<"/admin/storefront/reels/[id]">) {
  const { id } = await params;

  let reel;
  try {
    reel = await getReel(id);
  } catch (err) {
    if (err instanceof ServiceError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  const title = reel.title?.trim() || "Untitled reel";

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/admin/storefront/reels"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to reels
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
                href="/admin/storefront/reels"
                className="hover:text-foreground transition-colors"
              >
                Reels
              </Link>
            </nav>

            <h1 className="text-foreground truncate text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {title}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <span>
                {reel.published ? (
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

          <DeleteReelButton
            id={reel.id}
            name={title}
            variant="destructive"
            className="self-start sm:self-end"
          />
        </div>
      </header>

      <ReelForm mode="edit" reel={reel} />
    </div>
  );
}
