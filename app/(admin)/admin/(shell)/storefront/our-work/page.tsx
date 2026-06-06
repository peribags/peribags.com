import Link from "next/link";
import { Briefcase, Pencil, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listOurWork } from "@/lib/services/admin/our-work.service";
import { r2PublicUrl } from "@/lib/r2";
import { DeleteOurWorkButton } from "./delete-button";
import { FlashToast } from "./flash-toast";

export const metadata = { title: "Our Work" };

export default async function AdminOurWorkPage() {
  const items = await listOurWork();

  const total = items.length;
  const publishedCount = items.filter((i) => i.published).length;
  const withLogoCount = items.filter((i) => !!i.logoUrl).length;

  return (
    <div className="space-y-10">
      <FlashToast />

      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
            <Briefcase className="size-3" />
            Storefront · Our Work
          </p>
          <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
            Our Work
          </h1>
          <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
            Project cards shown on the /our-work page. Each item has a client
            name, an optional logo, a product picture, and a short description.
          </p>
        </div>

        <Button asChild size="lg" className="self-start sm:self-end">
          <Link href="/admin/storefront/our-work/new">
            <Plus className="size-4" />
            New item
          </Link>
        </Button>
      </header>

      {total > 0 && (
        <dl className="border-border bg-card grid grid-cols-3 divide-x divide-border overflow-hidden rounded-2xl border">
          <Stat label="Items" value={total} />
          <Stat label="Published" value={`${publishedCount}/${total}`} />
          <Stat label="With logo" value={withLogoCount} />
        </dl>
      )}

      {total === 0 ? (
        <EmptyState />
      ) : (
        <ul className="border-border bg-card divide-y divide-border overflow-hidden rounded-2xl border">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40"
            >
              <div className="bg-muted/40 size-14 shrink-0 overflow-hidden rounded-lg">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resolveOrPassthrough(item.imageUrl)}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium">
                  {item.name}
                </p>
                <p className="text-muted-foreground line-clamp-1 text-xs">
                  {item.description || "No description"}
                </p>
              </div>
              <span
                className={
                  item.published
                    ? "inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400"
                    : "inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400"
                }
              >
                <span
                  className={
                    item.published
                      ? "size-1.5 rounded-full bg-emerald-500"
                      : "size-1.5 rounded-full bg-amber-500"
                  }
                />
                {item.published ? "Published" : "Draft"}
              </span>
              <Button asChild variant="ghost" size="sm" className="h-8">
                <Link href={`/admin/storefront/our-work/${item.id}`}>
                  <Pencil className="size-3.5" />
                  <span className="sr-only">Edit</span>
                </Link>
              </Button>
              <DeleteOurWorkButton id={item.id} name={item.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function resolveOrPassthrough(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return r2PublicUrl(value);
}

function Stat({ label, value }: { label: string; value: number | string }) {
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
          <Briefcase className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            No items yet
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            Add your first work card — a client name, a product picture, and a
            short description.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/storefront/our-work/new">
            <Plus className="size-4" />
            Add your first item
          </Link>
        </Button>
      </div>
    </section>
  );
}
