import Link from "next/link";
import {
  ChevronRight,
  Inbox,
  Mail,
  MessageSquare,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  countEnquiriesByStatus,
  listEnquiries,
} from "@/lib/services/admin/enquiries.service";
import { cn } from "@/lib/utils";
import type { EnquiryStatus } from "@/types";
import { DeleteEnquiryButton } from "./delete-enquiry-button";
import { FlashToast } from "./flash-toast";

export const metadata = { title: "Enquiries" };

type FilterKey = EnquiryStatus | "all";

const TABS: { key: FilterKey; label: string }[] = [
  { key: "new", label: "New" },
  { key: "responded", label: "Responded" },
  { key: "archived", label: "Archived" },
  { key: "all", label: "All" },
];

function isFilterKey(v: string | undefined): v is FilterKey {
  return v === "new" || v === "responded" || v === "archived" || v === "all";
}

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
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
    year: "numeric",
  });
}

type SearchParams = Promise<{ status?: string; deleted?: string }>;

export default async function AdminEnquiryPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filter: FilterKey = isFilterKey(sp.status) ? sp.status : "new";

  const [{ rows: enquiries, total }, counts] = await Promise.all([
    listEnquiries({ status: filter }, { page: 1, pageSize: 100 }),
    countEnquiriesByStatus(),
  ]);

  return (
    <div className="space-y-10">
      <FlashToast />

      <header className="space-y-3">
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.18em] uppercase">
          <Inbox className="size-3" />
          Inbox · Enquiries
        </p>
        <h1 className="text-foreground text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          Customer enquiries
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          Every message a customer sends about a product — or via the contact
          form. Reply by email or phone, then mark as responded.
        </p>
      </header>

      <dl className="border-border bg-card grid grid-cols-2 divide-x divide-border overflow-hidden rounded-2xl border sm:grid-cols-4">
        <Stat label="New" value={counts.new} highlight={counts.new > 0} />
        <Stat label="Responded" value={counts.responded} />
        <Stat label="Archived" value={counts.archived} />
        <Stat label="Total" value={counts.all} />
      </dl>

      {/* Filter tabs */}
      <nav
        aria-label="Filter by status"
        className="border-border bg-card flex flex-wrap items-center gap-1 overflow-hidden rounded-xl border p-1"
      >
        {TABS.map((t) => {
          const active = filter === t.key;
          const count = counts[t.key];
          return (
            <Link
              key={t.key}
              href={
                t.key === "new" ? "/admin/enquiry" : `/admin/enquiry?status=${t.key}`
              }
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {t.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums leading-none",
                  active
                    ? "bg-background/15 text-background"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {total === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <section className="border-border bg-card overflow-hidden rounded-2xl border">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-5 py-3">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              {TABS.find((t) => t.key === filter)?.label} · {total}
            </span>
          </div>
          <ul>
            {enquiries.map((e, i) => (
              <li
                key={e.id}
                className={cn(
                  "group/row hover:bg-accent/40 transition-colors",
                  i < enquiries.length - 1 && "border-border border-b",
                )}
              >
                <div className="flex min-w-0 items-start gap-3 px-4 py-3.5">
                  <div
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      e.status === "new"
                        ? "bg-emerald-500"
                        : e.status === "responded"
                          ? "bg-sky-500"
                          : "bg-muted-foreground/40",
                    )}
                    aria-label={`Status: ${e.status}`}
                  />

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                      <Link
                        href={`/admin/enquiry/${e.id}`}
                        className="text-foreground hover:text-foreground/80 truncate text-sm font-semibold leading-tight tracking-tight underline-offset-4 hover:underline"
                      >
                        {e.customerName}
                      </Link>
                      {e.customerEmail && (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                          <Mail className="size-3" />
                          {e.customerEmail}
                        </span>
                      )}
                      {e.customerPhone && (
                        <span className="text-muted-foreground inline-flex items-center gap-1 text-[11px]">
                          <Phone className="size-3" />
                          {e.customerPhone}
                        </span>
                      )}
                    </div>

                    <p className="text-foreground/80 line-clamp-2 max-w-3xl text-sm leading-relaxed">
                      {e.message}
                    </p>

                    <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                      {e.product ? (
                        <Link
                          href={`/admin/products/${e.product.id}`}
                          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
                        >
                          <MessageSquare className="size-3" />
                          About{" "}
                          <span className="text-foreground/85 font-medium">
                            {e.product.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <MessageSquare className="size-3" />
                          General enquiry
                        </span>
                      )}
                      <span aria-hidden>·</span>
                      <span>{formatRelative(e.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
                    <Link
                      href={`/admin/enquiry/${e.id}`}
                      className="text-muted-foreground hover:text-foreground hover:bg-accent inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors"
                    >
                      Open
                      <ChevronRight className="size-3.5" />
                    </Link>
                    <DeleteEnquiryButton
                      id={e.id}
                      customerName={e.customerName}
                      variant="icon"
                    />
                  </div>
                </div>
              </li>
            ))}
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
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 px-5 py-4">
      <dt className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "text-2xl font-semibold leading-none tracking-tight tabular-nums",
          highlight ? "text-emerald-700 dark:text-emerald-400" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterKey }) {
  const copy = {
    new: {
      title: "Inbox zero",
      hint: "No new enquiries right now. Customer messages sent from the storefront will land here.",
    },
    responded: {
      title: "Nothing here yet",
      hint: "Once you reply to an enquiry and mark it as responded, it’ll appear in this tab.",
    },
    archived: {
      title: "No archived enquiries",
      hint: "Old enquiries you’ve filed away will live here.",
    },
    all: {
      title: "No enquiries yet",
      hint: "Once a customer sends an enquiry from the storefront, it’ll appear here.",
    },
  }[filter];

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
          <Inbox className="text-foreground/70 size-7" />
          <span className="bg-foreground absolute -right-2 -top-2 grid size-6 place-items-center rounded-full">
            <Sparkles className="text-background size-3" />
          </span>
        </div>
        <div className="space-y-2">
          <h2 className="text-foreground text-2xl font-semibold tracking-tight">
            {copy.title}
          </h2>
          <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
            {copy.hint}
          </p>
        </div>
      </div>
    </section>
  );
}
