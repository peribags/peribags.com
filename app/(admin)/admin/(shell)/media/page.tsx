import { Images } from "lucide-react";
import { MediaBrowser } from "./media-browser";

export const metadata = { title: "Media" };

export default function AdminMediaPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
          <Images className="size-3" />
          Library · Media
        </p>
        <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          Media library
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Every image and video uploaded to your storage. Click a file to see
          its details, copy its URL, or delete it. Deleting a file that&apos;s
          still in use will break wherever it appears.
        </p>
      </header>

      <MediaBrowser />
    </div>
  );
}
