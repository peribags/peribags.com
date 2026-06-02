import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BannerSlideForm } from "../banner-slide-form";

export const metadata = { title: "New banner slide" };

export default function NewBannerSlidePage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/admin/storefront/home-banner"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to home banner
        </Link>

        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Storefront · Home Banner
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            New slide
          </h1>
          <p className="text-muted-foreground text-sm">
            Add an image or video slide to the homepage hero carousel.
          </p>
        </div>
      </header>

      <BannerSlideForm mode="create" />
    </div>
  );
}
