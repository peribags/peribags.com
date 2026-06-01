import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categoryTiles, type CategoryTile } from "@/lib/category-tiles";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "All Categories | Perry Bags",
  description:
    "Browse every Perry Bags category — totes, slings, backpacks, wallets, and more.",
};

export default function CategoryIndexPage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 pt-10 pb-16 md:px-6 md:pt-14 md:pb-20 lg:px-[4vw] lg:pt-16 lg:pb-24">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-zinc-500">
            <li>
              <Link href="/" className="transition-colors hover:text-zinc-900">
                Home
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3.5 text-zinc-400" />
            </li>
            <li className="text-zinc-900">Categories</li>
          </ol>
        </nav>

        {/* Header — left aligned */}
        <header
          className="mt-6 flex flex-col gap-4 border-b border-zinc-200 pb-6 md:mt-8 md:flex-row md:items-end md:justify-between md:gap-6 md:pb-8"
          data-aos="fade-up"
        >
          <div>
            <h1 className="text-2xl font-medium tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl">
              Shop by Category
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-600 sm:text-base">
              Browse the full Perry Bags range — totes, slings, backpacks,
              wallets, and more.
            </p>
          </div>

          <p className="text-xs tabular-nums text-zinc-500 md:text-sm">
            {categoryTiles.length}{" "}
            {categoryTiles.length === 1 ? "category" : "categories"}
          </p>
        </header>

        {/* Grid */}
        <div
          className="mt-10 grid grid-cols-2 gap-x-3 gap-y-10 md:mt-12 lg:grid-cols-5 lg:gap-x-4 lg:gap-y-14"
          data-aos="fade-up"
          data-aos-delay="120"
        >
          {categoryTiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TileCard({ tile }: { tile: CategoryTile }) {
  return (
    <Link href={tile.href} className="group/card block">
      <div
        className={cn(
          "relative aspect-[4/5.5] overflow-hidden",
          tile.gradient ?? "bg-zinc-100",
        )}
      >
        {tile.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tile.imageUrl}
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
