import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OurWorkForm } from "../our-work-form";

export const metadata = { title: "New work item" };

export default function NewOurWorkPage() {
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

        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Storefront · Our Work
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            New work item
          </h1>
          <p className="text-muted-foreground text-sm">
            Add a project card to the /our-work page.
          </p>
        </div>
      </header>

      <OurWorkForm mode="create" />
    </div>
  );
}
