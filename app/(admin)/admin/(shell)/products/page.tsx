import Link from "next/link";
import { ChevronRight, ImageIcon, Package, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listCategories } from "@/lib/services/admin/categories.service";
import { listProducts } from "@/lib/services/admin/products.service";
import { r2PublicUrl } from "@/lib/r2";
import { cn } from "@/lib/utils";
import { DeleteProductButton } from "./delete-product-button";
import { FlashToast } from "./flash-toast";

export const metadata = { title: "Products" };

function formatINR(paise: number | null) {
  if (paise == null) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default async function AdminProductsPage() {
  const [{ rows: products, total }, categories] = await Promise.all([
    listProducts({ page: 1, pageSize: 100 }),
    listCategories(),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const publishedCount = products.filter((p) => p.published).length;
  const featuredCount = products.filter((p) => p.featured).length;
  const outOfStock = products.filter((p) => !p.inStock).length;

  return (
    <div className="space-y-10">
      <FlashToast />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            <Package className="size-3" />
            Catalogue · Products
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Product catalogue
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Every bag, wallet, and accessory you offer. Add rich descriptions,
            multiple images, and pin them to one or more categories.
          </p>
        </div>

        <Button asChild size="lg" className="self-start sm:self-end">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            New product
          </Link>
        </Button>
      </header>

      {total > 0 && (
        <dl className="border-border bg-card grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border sm:grid-cols-4">
          <Stat label="Products" value={total} />
          <Stat label="Published" value={`${publishedCount}/${total}`} />
          <Stat label="Featured" value={featuredCount} />
          <Stat label="Out of stock" value={outOfStock} />
        </dl>
      )}

      {total === 0 ? (
        <EmptyState />
      ) : (
        <section className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Products
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {total} {total === 1 ? "item" : "items"}
            </span>
          </div>
          <ul>
            {products.map((p, i) => {
              const cats = p.categoryIds
                .map((id) => categoryById.get(id))
                .filter((c): c is NonNullable<typeof c> => Boolean(c));
              const hero = p.images[0] ?? null;

              return (
                <li
                  key={p.id}
                  className={cn(
                    "group/row hover:bg-accent/40 transition-colors",
                    i < products.length - 1 && "border-border border-b",
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3 px-4 py-3">
                    <Thumb src={hero} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-foreground hover:text-foreground/80 truncate text-sm font-semibold leading-tight tracking-tight underline-offset-4 hover:underline"
                        >
                          {p.name}
                        </Link>
                        <code className="text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none">
                          {p.slug}
                        </code>
                        {!p.published && (
                          <Badge tone="amber">Draft</Badge>
                        )}
                        {p.featured && p.published && (
                          <Badge tone="violet">Featured</Badge>
                        )}
                        {!p.inStock && (
                          <Badge tone="red">Out of stock</Badge>
                        )}
                      </div>
                      {cats.length > 0 && (
                        <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                          {cats.map((c) => (
                            <span
                              key={c.id}
                              className="border-border/80 inline-flex items-center rounded-full border px-1.5 py-0.5"
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-right">
                      {p.pricePaise != null ? (
                        <div className="text-foreground text-sm font-semibold tabular-nums">
                          {formatINR(p.pricePaise)}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-[11px]">
                          Price on request
                        </div>
                      )}
                      {p.images.length > 1 && (
                        <div className="text-muted-foreground mt-0.5 text-[10px]">
                          {p.images.length} images
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        title="Edit product"
                      >
                        <Link href={`/admin/products/${p.id}`}>
                          <ChevronRight className="size-3.5" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                      </Button>
                      <DeleteProductButton
                        id={p.id}
                        name={p.name}
                        variant="icon"
                      />
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <dt className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </dt>
      <dd className="text-foreground text-2xl font-semibold leading-none tracking-tight tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <div className="from-muted/40 to-muted ring-border/60 relative size-12 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br ring-1">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={r2PublicUrl(src)}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground/60 grid size-full place-items-center">
          <ImageIcon className="size-4" />
        </div>
      )}
    </div>
  );
}

function Badge({
  tone,
  children,
}: {
  tone: "amber" | "violet" | "red";
  children: React.ReactNode;
}) {
  const styles = {
    amber:
      "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    violet:
      "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    red: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
        styles,
      )}
    >
      {children}
    </span>
  );
}

function EmptyState() {
  return (
    <section className="border-border bg-card relative overflow-hidden rounded-3xl border">
      <div
        aria-hidden
        className="text-border absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage:
            "radial-gradient(ellipse at center, black 0%, transparent 70%)",
        }}
      />
      <div className="relative grid place-items-center gap-6 px-6 py-20 text-center">
        <div className="border-border bg-background relative flex size-16 items-center justify-center rounded-2xl border shadow-sm">
          <Package className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            No products yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Add your first bag — give it a name, a price, a few images, and
            pin it to a category.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/products/new">
            <Plus className="size-4" />
            Create your first product
          </Link>
        </Button>
      </div>
    </section>
  );
}
