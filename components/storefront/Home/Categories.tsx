import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { categoryTiles, type CategoryTile } from "@/lib/category-tiles";
import { cn } from "@/lib/utils";

export default function Categories() {
  return (
    <section className="bg-white">
      <div className="max-w-[1600px] mx-auto px-4 py-8 md:px-6 md:py-10 lg:px-[4vw] lg:py-[4vw]">
        {/* Section header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Shop by Category
            </p>
            <h2 className="text-4xl font-normal leading-[1.05] tracking-tight text-zinc-950 sm:text-5xl">
              Find your everyday companion.
            </h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-1.5 self-start text-sm font-medium tracking-tight text-zinc-900 transition-all hover:gap-2 sm:self-end"
          >
            View all
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid — horizontal scroll on mobile (8 tiles compress nicely),
            2-col on tablet, 4×2 on desktop. */}
        <div
          className={cn(
            "mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 -mx-4 px-4",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-x-5 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0",
            "lg:mt-16 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-14",
          )}
        >
          {categoryTiles.map((tile) => (
            <TileCard
              key={tile.id}
              tile={tile}
              className="w-[72%] shrink-0 snap-start sm:w-auto sm:shrink"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TileCard({
  tile,
  className,
}: {
  tile: CategoryTile;
  className?: string;
}) {
  return (
    <Link
      href={tile.href}
      className={cn(
        "group/tile relative isolate block aspect-[4/5] overflow-hidden",
        tile.gradient ?? "bg-zinc-100",
        className,
      )}
    >
      {/* Image */}
      {tile.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          // src={tile.imageUrl}
          src={"/sling.jpg"}
          alt={tile.name}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tile:scale-[1.04]"
        />
      )}

      {/* Overlay — soft gradient bottom-up, deepens slightly on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent transition-opacity duration-500 ease-out group-hover/tile:opacity-90" />

      {/* Label — bottom-left, inline with arrow on the right */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-6">
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-base font-medium tracking-tight text-white sm:text-lg lg:text-xl">
            {tile.name}
          </h3>
          <ArrowUpRight
            className="size-4 shrink-0 text-white/75 transition-all duration-300 ease-out group-hover/tile:-translate-y-0.5 group-hover/tile:translate-x-0.5 group-hover/tile:text-white sm:size-[18px]"
            aria-hidden
          />
        </div>
      </div>
    </Link>
  );
}
