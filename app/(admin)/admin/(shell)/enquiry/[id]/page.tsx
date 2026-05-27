import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  Inbox,
  Mail,
  MessageSquare,
  Package,
  Phone,
} from "lucide-react";
import { getEnquiry } from "@/lib/services/admin/enquiries.service";
import { ServiceError } from "@/lib/services/shared/errors";
import { DeleteEnquiryButton } from "../delete-enquiry-button";
import { NotesForm } from "./notes-form";
import { StatusButtons } from "./status-buttons";

export const metadata = { title: "Enquiry" };

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export default async function EnquiryDetailPage({
  params,
}: PageProps<"/admin/enquiry/[id]">) {
  const { id } = await params;

  let enquiry;
  try {
    enquiry = await getEnquiry(id);
  } catch (err) {
    if (err instanceof ServiceError && err.code === "NOT_FOUND") notFound();
    throw err;
  }

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Link
          href="/admin/enquiry"
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to inbox
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 space-y-3">
            <nav
              aria-label="Breadcrumb"
              className="text-muted-foreground flex flex-wrap items-center gap-1 text-[11px] font-semibold tracking-[0.14em] uppercase"
            >
              <span>Inbox</span>
              <ChevronRight className="size-3" />
              <Link
                href="/admin/enquiry"
                className="hover:text-foreground transition-colors"
              >
                Enquiries
              </Link>
            </nav>

            <h1 className="text-foreground truncate text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
              {enquiry.customerName}
            </h1>

            <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
              <span>{formatDateTime(enquiry.createdAt)}</span>
              {enquiry.product ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Package className="size-3" />
                    About{" "}
                    <Link
                      href={`/admin/products/${enquiry.product.id}`}
                      className="text-foreground/80 hover:text-foreground font-medium underline-offset-2 hover:underline"
                    >
                      {enquiry.product.name}
                    </Link>
                  </span>
                </>
              ) : (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Inbox className="size-3" />
                    General enquiry
                  </span>
                </>
              )}
            </div>
          </div>

          <DeleteEnquiryButton
            id={enquiry.id}
            customerName={enquiry.customerName}
            variant="destructive"
            className="self-start sm:self-end"
          />
        </div>
      </header>

      <StatusButtons id={enquiry.id} current={enquiry.status} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-10">
          <Section
            kicker="Message"
            title="What they wrote"
          >
            <div className="border-border bg-card rounded-2xl border p-6">
              <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
                {enquiry.message}
              </p>
            </div>
          </Section>

          <Section
            kicker="Internal"
            title="Notes"
            description="Visible to admin only. Use for follow-up reminders, quoted prices, anything you don’t want to retype."
          >
            <NotesForm id={enquiry.id} defaultValue={enquiry.notes ?? ""} />
          </Section>
        </div>

        {/* ───────────── Sidebar ───────────── */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <SidebarSection title="Contact">
            {enquiry.customerEmail && (
              <ContactRow
                icon={Mail}
                label="Email"
                value={enquiry.customerEmail}
                primaryHref={`mailto:${enquiry.customerEmail}?subject=${encodeURIComponent("Re: your enquiry")}`}
                primaryLabel="Reply"
              />
            )}
            {enquiry.customerPhone && (
              <ContactRow
                icon={Phone}
                label="Phone"
                value={enquiry.customerPhone}
                primaryHref={`tel:${enquiry.customerPhone.replace(/\s+/g, "")}`}
                primaryLabel="Call"
                secondaryHref={whatsappLink(enquiry.customerPhone) ?? undefined}
                secondaryLabel="WhatsApp"
              />
            )}
            {!enquiry.customerEmail && !enquiry.customerPhone && (
              <p className="text-muted-foreground text-xs">
                No contact details on this enquiry.
              </p>
            )}
          </SidebarSection>

          {enquiry.product && (
            <SidebarSection title="Product">
              <Link
                href={`/admin/products/${enquiry.product.id}`}
                className="group/prod border-border hover:border-foreground/20 hover:bg-accent/40 flex items-center justify-between gap-3 rounded-xl border p-3 transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-foreground/90 truncate text-sm font-medium leading-tight">
                    {enquiry.product.name}
                  </p>
                  <code className="text-muted-foreground bg-muted/60 rounded px-1.5 py-0.5 font-mono text-[10px] leading-none">
                    {enquiry.product.slug}
                  </code>
                </div>
                <ChevronRight className="text-muted-foreground group-hover/prod:text-foreground size-4 shrink-0 transition-colors" />
              </Link>
            </SidebarSection>
          )}

          <SidebarSection title="Meta">
            <MetaRow icon={MessageSquare} label="Status" value={enquiry.status} />
            <MetaRow
              icon={Inbox}
              label="Received"
              value={formatDateTime(enquiry.createdAt)}
            />
            {enquiry.sourceUrl && (
              <MetaRow
                icon={Globe}
                label="From page"
                value={enquiry.sourceUrl}
                href={enquiry.sourceUrl}
              />
            )}
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────────────

function Section({
  kicker,
  title,
  description,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-1.5">
        {kicker && (
          <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.18em] uppercase">
            {kicker}
          </p>
        )}
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-border bg-card space-y-3 rounded-2xl border p-5">
      <h3 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ContactRow({
  icon: Icon,
  label,
  value,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="text-muted-foreground size-3.5 shrink-0" />
        <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          {label}
        </span>
      </div>
      <a
        href={primaryHref}
        className="text-foreground hover:text-foreground/80 block break-all text-sm font-medium underline-offset-4 hover:underline"
      >
        {value}
      </a>
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <a
          href={primaryHref}
          className="border-border bg-background hover:bg-accent hover:text-foreground inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors"
        >
          {primaryLabel}
        </a>
        {secondaryHref && secondaryLabel && (
          <a
            href={secondaryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="border-border bg-background hover:bg-accent hover:text-foreground inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors"
          >
            {secondaryLabel}
          </a>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
}) {
  const valueNode = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground/85 hover:text-foreground break-all text-xs underline-offset-2 hover:underline"
    >
      {value}
    </a>
  ) : (
    <span className="text-foreground/85 text-xs capitalize">{value}</span>
  );

  return (
    <div className="flex items-start gap-2.5">
      <Icon className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-muted-foreground text-[10px] font-semibold tracking-[0.14em] uppercase">
          {label}
        </p>
        <div className="mt-0.5">{valueNode}</div>
      </div>
    </div>
  );
}
