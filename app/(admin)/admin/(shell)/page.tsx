import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  FolderTree,
  ImageIcon,
  Inbox,
  LayoutDashboard,
  Mail,
  Package,
  Phone,
  Plus,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { getDashboardStats } from "@/lib/services/admin/dashboard.service";
import { listEnquiries } from "@/lib/services/admin/enquiries.service";
import { listProducts } from "@/lib/services/admin/products.service";
import { r2PublicUrl } from "@/lib/r2";
import { cn } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Good night";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Good night";
}

export default async function AdminDashboardPage() {
  const [user, stats, latestProducts, newEnquiries] = await Promise.all([
    getUser(),
    getDashboardStats(),
    listProducts({ page: 1, pageSize: 5 }),
    listEnquiries({ status: "new" }, { page: 1, pageSize: 5 }),
  ]);

  const displayName =
    (typeof user?.user_metadata?.display_name === "string"
      ? user.user_metadata.display_name
      : null) ||
    user?.email?.split("@")[0] ||
    "there";

  const needsAttention =
    stats.enquiries.new > 0 || stats.products.outOfStock > 0;

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
          <LayoutDashboard className="size-3" />
          Overview · Dashboard
        </p>
        <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          {greeting()}, {displayName}.
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          {needsAttention ? (
            <>
              You have things waiting for you. Take a look at the inbox and
              the catalogue below.
            </>
          ) : (
            <>
              Everything looks calm. Here’s the state of the catalogue and
              recent activity.
            </>
          )}
        </p>
      </header>

      {/* KPI strip */}
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard
          href="/admin/products"
          icon={Package}
          label="Products"
          value={stats.products.total}
          sub={
            stats.products.total > 0
              ? `${stats.products.published} published · ${stats.products.drafts} drafts`
              : "Start your catalogue"
          }
        />
        <KpiCard
          href="/admin/category"
          icon={FolderTree}
          label="Categories"
          value={stats.categories.total}
          sub={
            stats.categories.total > 0
              ? "Organise the catalogue"
              : "Add your first category"
          }
        />
        <KpiCard
          href="/admin/enquiry"
          icon={Inbox}
          label="New enquiries"
          value={stats.enquiries.new}
          sub={
            stats.enquiries.total > 0
              ? `${stats.enquiries.total} total received`
              : "Inbox zero"
          }
          highlight={stats.enquiries.new > 0 ? "emerald" : undefined}
        />
        <KpiCard
          href="/admin/products"
          icon={AlertTriangle}
          label="Out of stock"
          value={stats.products.outOfStock}
          sub={
            stats.products.outOfStock > 0
              ? "Mark in stock when restocked"
              : "All available"
          }
          highlight={stats.products.outOfStock > 0 ? "red" : undefined}
        />
      </dl>

      {/* Two-column: recent enquiries + latest products */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* New enquiries */}
        <Panel
          title="New enquiries"
          subtitle={
            stats.enquiries.new > 0
              ? `${stats.enquiries.new} waiting`
              : "Nothing waiting"
          }
          action={
            stats.enquiries.new > 0
              ? { href: "/admin/enquiry", label: "Open inbox" }
              : undefined
          }
        >
          {newEnquiries.rows.length === 0 ? (
            <PanelEmpty
              icon={Inbox}
              title="Inbox zero"
              hint="New enquiries from the storefront will appear here."
            />
          ) : (
            <ul className="divide-border divide-y">
              {newEnquiries.rows.map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/admin/enquiry/${e.id}`}
                    className="hover:bg-accent/40 group/row flex items-start gap-3 px-4 py-3 transition-colors"
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="text-foreground truncate text-sm font-semibold leading-tight">
                          {e.customerName}
                        </span>
                        {e.customerEmail && (
                          <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                            <Mail className="size-2.5" />
                            {e.customerEmail}
                          </span>
                        )}
                        {!e.customerEmail && e.customerPhone && (
                          <span className="text-muted-foreground inline-flex items-center gap-1 text-[10px]">
                            <Phone className="size-2.5" />
                            {e.customerPhone}
                          </span>
                        )}
                      </div>
                      <p className="text-foreground/75 line-clamp-1 text-xs leading-relaxed">
                        {e.message}
                      </p>
                      <div className="text-muted-foreground flex items-center gap-1.5 text-[10px]">
                        {e.product ? (
                          <span className="truncate">
                            About{" "}
                            <span className="text-foreground/80 font-medium">
                              {e.product.name}
                            </span>
                          </span>
                        ) : (
                          <span>General enquiry</span>
                        )}
                        <span aria-hidden>·</span>
                        <span>{formatRelative(e.createdAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="text-muted-foreground/60 group-hover/row:text-foreground mt-1 size-4 shrink-0 transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Latest products */}
        <Panel
          title="Latest products"
          subtitle={
            stats.products.total > 0
              ? `${stats.products.total} in catalogue`
              : "Nothing yet"
          }
          action={
            stats.products.total > 0
              ? { href: "/admin/products", label: "View all" }
              : undefined
          }
        >
          {latestProducts.rows.length === 0 ? (
            <PanelEmpty
              icon={Package}
              title="No products yet"
              hint="Add your first bag to populate the catalogue."
              cta={{ href: "/admin/products/new", label: "Create product" }}
            />
          ) : (
            <ul className="divide-border divide-y">
              {latestProducts.rows.map((p) => {
                const hero = p.images[0] ?? null;
                return (
                  <li key={p.id}>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="hover:bg-accent/40 group/row flex items-center gap-3 px-4 py-3 transition-colors"
                    >
                      <Thumb src={hero} />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="text-foreground truncate text-sm font-semibold leading-tight">
                          {p.name}
                        </p>
                        <div className="text-muted-foreground flex flex-wrap items-center gap-1.5 text-[10px]">
                          {p.published ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-emerald-500" />
                              Published
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              Draft
                            </span>
                          )}
                          <span aria-hidden>·</span>
                          <span>{formatRelative(p.createdAt)}</span>
                          {!p.inStock && (
                            <>
                              <span aria-hidden>·</span>
                              <span className="text-red-700 dark:text-red-400">
                                Out of stock
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="text-muted-foreground/60 group-hover/row:text-foreground size-4 shrink-0 transition-colors" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      {/* Quick actions */}
      <section className="border-border bg-card relative overflow-hidden rounded-2xl border p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[10px] font-semibold tracking-[0.18em] uppercase">
              <Sparkles className="size-3" />
              Quick actions
            </p>
            <h2 className="text-foreground text-lg font-semibold tracking-tight">
              Jump back in
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="default">
              <Link href="/admin/products/new">
                <Plus className="size-3.5" />
                New product
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/category/new">
                <Plus className="size-3.5" />
                New category
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/admin/enquiry">
                <Inbox className="size-3.5" />
                Inbox
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

type HighlightTone = "emerald" | "red";

function KpiCard({
  href,
  icon: Icon,
  label,
  value,
  sub,
  highlight,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  sub: string;
  highlight?: HighlightTone;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group/kpi border-border bg-card hover:border-foreground/30 relative flex flex-col gap-4 overflow-hidden rounded-2xl border p-5 transition-colors",
      )}
    >
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            highlight === "emerald"
              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              : highlight === "red"
                ? "bg-red-500/10 text-red-700 dark:text-red-400"
                : "bg-muted text-muted-foreground",
          )}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>
        <ArrowUpRight className="text-muted-foreground/40 group-hover/kpi:text-foreground size-4 transition-colors" />
      </div>
      <div className="space-y-1">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
          {label}
        </p>
        <p
          className={cn(
            "text-4xl font-semibold leading-none tracking-tight tabular-nums",
            highlight === "emerald"
              ? "text-emerald-700 dark:text-emerald-400"
              : highlight === "red"
                ? "text-red-700 dark:text-red-400"
                : "text-foreground",
          )}
        >
          {value}
        </p>
        <p className="text-muted-foreground line-clamp-1 text-xs">{sub}</p>
      </div>
    </Link>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle: string;
  action?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border bg-muted/30 flex items-center justify-between gap-3 border-b px-5 py-3">
        <div className="min-w-0">
          <h2 className="text-foreground truncate text-sm font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-muted-foreground truncate text-[11px]">
            {subtitle}
          </p>
        </div>
        {action && (
          <Link
            href={action.href}
            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 items-center gap-1 text-xs font-medium transition-colors"
          >
            {action.label}
            <ChevronRight className="size-3.5" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function PanelEmpty({
  icon: Icon,
  title,
  hint,
  cta,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="grid place-items-center gap-3 px-6 py-12 text-center">
      <div className="bg-muted/50 grid size-10 place-items-center rounded-xl">
        <Icon className="text-muted-foreground size-4" />
      </div>
      <div className="space-y-1">
        <p className="text-foreground text-sm font-semibold tracking-tight">
          {title}
        </p>
        <p className="text-muted-foreground mx-auto max-w-xs text-xs leading-relaxed">
          {hint}
        </p>
      </div>
      {cta && (
        <Button asChild size="sm" variant="outline" className="mt-1">
          <Link href={cta.href}>
            <Plus className="size-3.5" />
            {cta.label}
          </Link>
        </Button>
      )}
    </div>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <div className="from-muted/40 to-muted ring-border/60 relative size-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br ring-1">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={r2PublicUrl(src)}
          alt=""
          className="size-full object-cover"
        />
      ) : (
        <div className="text-muted-foreground/60 grid size-full place-items-center">
          <ImageIcon className="size-3.5" />
        </div>
      )}
    </div>
  );
}
