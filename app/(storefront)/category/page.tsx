import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryTiles, type CategoryTile } from "@/lib/category-tiles";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "All Categories | Perry Bags",
  description: "Browse every Perry Bags category — totes, slings, backpacks, wallets, and more.",
};

export default function CategoryIndexPage() {
  const count = categoryTiles.length;

  return (
    <>
      {/* ── Page header — editorial, cream band ─────────────────────────── */}
      <section style={{ backgroundColor: "#FAF7F1" }}>
        <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-14 md:px-6 md:pt-14 md:pb-20 lg:px-[4vw] lg:pt-16 lg:pb-24">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              <li>
                <Link href="/" className="transition-colors hover:text-zinc-950">
                  Home
                </Link>
              </li>
              <li aria-hidden>
                <ChevronRight className="size-3 text-zinc-400" />
              </li>
              <li className="text-zinc-950">Catalogue</li>
            </ol>
          </nav>

          {/* Hero — heading left, meta right (desktop) */}
          <div className="mt-10 grid grid-cols-12 gap-x-8 gap-y-10 lg:mt-14">
            <div className="col-span-12 lg:col-span-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                The Collections
              </p>
              <h1 className="mt-3 text-4xl font-normal leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl xl:text-7xl">
                Every silhouette,
                <br />
                in one place.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                From everyday totes to occasion-only clutches — the full Perry
                Bags range, organised the way you'd browse a shelf.
              </p>
            </div>

            {/* Meta column */}
            <div className="col-span-12 lg:col-span-4 lg:self-end">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-zinc-900/15 pt-6 text-sm lg:max-w-xs lg:justify-self-end">
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  Categories
                </dt>
                <dd className="tabular-nums text-zinc-950">
                  {String(count).padStart(2, "0")}
                </dd>
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  Season
                </dt>
                <dd className="text-zinc-950">SS26</dd>
                <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  Updated
                </dt>
                <dd className="text-zinc-950">May 2026</dd>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories grid ────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-6 md:py-16 lg:px-[4vw] lg:py-20">
          <div className="flex items-end justify-between border-b border-zinc-200 pb-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Browse all
            </p>
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] tabular-nums text-zinc-500">
              {String(count).padStart(2, "0")} · {count === 1 ? "Category" : "Categories"}
            </p>
          </div>

          <div
            className={cn(
              "mt-10 grid grid-cols-2 gap-x-3 gap-y-10 lg:mt-14 lg:grid-cols-4 lg:gap-x-4 lg:gap-y-14",
              "md:[&_a]:transition-opacity md:[&_a]:duration-500 md:[&_a]:ease-out",
              "md:has-[a:hover]:[&_a:not(:hover)]:opacity-40",
            )}
          >
            {categoryTiles.map((tile) => (
              <TileCard key={tile.id} tile={tile} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function TileCard({ tile }: { tile: CategoryTile }) {
  return (
    <Link href={tile.href} className="group/card block">
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden",
          tile.gradient ?? "bg-zinc-100",
        )}
      >
        {tile.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={"/sling.jpg"}
            alt={tile.name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 size-full object-cover md:transition-transform md:duration-[900ms] md:ease-[cubic-bezier(0.22,1,0.36,1)] md:group-hover/card:scale-[1.04]"
          />
        )}
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-sm font-medium tracking-tight text-zinc-950 sm:text-base">
          <span
            className={cn(
              "relative inline-block",
              "md:after:absolute md:after:inset-x-0 md:after:-bottom-0.5 md:after:h-px md:after:origin-center md:after:scale-x-0 md:after:bg-zinc-950 md:after:transition-transform md:after:duration-500 md:after:ease-out md:after:content-['']",
              "md:group-hover/card:after:scale-x-100",
            )}
          >
            {tile.name}
          </span>
        </h3>
      </div>
    </Link>
  );
}
