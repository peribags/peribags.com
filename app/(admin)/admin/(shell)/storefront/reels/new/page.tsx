import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ReelForm } from "../reel-form";

export const metadata = { title: "New reel" };

export default function NewReelPage() {
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

        <div className="space-y-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-[0.18em] uppercase">
            Storefront · Reels
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            New reel
          </h1>
          <p className="text-muted-foreground text-sm">
            Upload a video and add a caption and promotion link.
          </p>
        </div>
      </header>

      <ReelForm mode="create" />
    </div>
  );
}
