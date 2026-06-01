"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, X } from "lucide-react";
import type { ProductDetail } from "@/lib/product-detail";
import { cn } from "@/lib/utils";

type Props = {
  product: ProductDetail;
};

export default function ProductInfo({ product }: Props) {
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = { title: product.name, text: product.tagline, url };
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share(data);
        return;
      } catch {
        /* user dismissed */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareToast("Link copied");
      setTimeout(() => setShareToast(null), 2000);
    } catch {
      setShareToast("Couldn't copy link");
      setTimeout(() => setShareToast(null), 2000);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Kicker — category link */}
      <Link
        href={`/category/${product.categorySlug}` as never}
        className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-zinc-950"
      >
        {product.categoryName}
        <ChevronRight className="size-3" />
      </Link>

      {/* Title */}
      <h1 className="mt-3 text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.05]">
        {product.name}
      </h1>

      {/* Tagline */}
      <p className="mt-4 text-base leading-relaxed text-zinc-600">
        {product.tagline}
      </p>

      {/* Stock badge */}
      <div className="mt-5 flex items-center gap-2 text-xs">
        <span
          className={cn(
            "inline-block size-2 rounded-full",
            product.inStock ? "bg-emerald-500" : "bg-zinc-400",
          )}
        />
        <span className={cn(product.inStock ? "text-zinc-700" : "text-zinc-500")}>
          {product.inStock
            ? "In stock — ready to ship"
            : "Out of stock — enquire for restock"}
        </span>
        <span className="text-zinc-300">·</span>
        <span className="font-mono text-zinc-500">{product.sku}</span>
      </div>

      {/* Hairline */}
      <div className="mt-8 border-t border-zinc-200" />

      {/* Colours */}
      {product.colors.length > 0 && (
        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
              Colour
            </h3>
            {selectedColor && (
              <p className="text-sm text-zinc-700">{selectedColor}</p>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.colors.map((c) => {
              const active = c.name === selectedColor;
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.name)}
                  aria-pressed={active}
                  title={c.name}
                  className={cn(
                    "grid size-9 place-items-center rounded-full border-2 transition-colors",
                    active
                      ? "border-zinc-950"
                      : "border-transparent hover:border-zinc-300",
                  )}
                >
                  <span
                    className="block size-7 rounded-full border border-zinc-900/15"
                    style={{ backgroundColor: c.hex }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setEnquiryOpen(true)}
          className="group/cta inline-flex items-center justify-center gap-2 bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white transition-all hover:gap-3 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
        >
          Enquire about this product
          <ArrowRight className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center justify-center gap-2 border border-zinc-300 px-6 py-3.5 text-sm font-medium tracking-tight text-zinc-900 transition-colors hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
        >
          <ShareIcon className="size-4" />
          Share
        </button>
      </div>

      {shareToast && (
        <p
          role="status"
          className="mt-2 text-xs text-zinc-500"
          aria-live="polite"
        >
          {shareToast}
        </p>
      )}

      {/* Features */}
      <div className="mt-10 border-t border-zinc-200 pt-8">
        <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          The details
        </h3>
        <ul className="mt-5 space-y-4">
          {product.features.map((f) => (
            <li key={f.title} className="flex gap-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-zinc-950 text-white">
                <Check className="size-3" strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium tracking-tight text-zinc-950">
                  {f.title}
                </p>
                <p className="mt-0.5 text-sm leading-relaxed text-zinc-600">
                  {f.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Enquiry dialog */}
      {enquiryOpen && (
        <EnquiryDialog
          product={product}
          selectedColor={selectedColor}
          onClose={() => setEnquiryOpen(false)}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Enquiry dialog (modal)
// ─────────────────────────────────────────────────────────────────────────────

function EnquiryDialog({
  product,
  selectedColor,
  onClose,
}: {
  product: ProductDetail;
  selectedColor?: string;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    // TODO: wire to /api/enquiry once that route exists.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (!portalTarget) return null;

  const content = (
    <div
      className="fixed inset-0 z-[110] grid place-items-end overflow-y-auto bg-zinc-950/60 backdrop-blur-sm sm:place-items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white p-6 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.5)] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  Enquiry
                </p>
                <h2 className="mt-2 text-xl font-medium tracking-tight text-zinc-950 sm:text-2xl">
                  {product.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full text-zinc-900 transition-colors hover:bg-zinc-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-zinc-600">
              Tell us a little about what you need — we'll get back within a
              business day.
            </p>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <Field label="Your name" name="name" required />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field
                  label="Email"
                  name="email"
                  type="email"
                  required
                />
                <Field label="Phone" name="phone" type="tel" />
              </div>
              <Field
                label="Message"
                name="message"
                textarea
                defaultValue={`Hi — I'd like to enquire about the ${product.name}${
                  selectedColor ? ` (${selectedColor})` : ""
                }.`}
                required
              />

              <input
                type="hidden"
                name="product"
                value={`${product.name} · ${product.sku}`}
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
              >
                {submitting ? "Sending…" : "Send enquiry"}
                {!submitting && <ArrowRight className="size-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="py-6 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
              <Check className="size-6" strokeWidth={2.5} />
            </span>
            <h2 className="mt-5 text-xl font-medium tracking-tight text-zinc-950">
              Thanks — we'll be in touch.
            </h2>
            <p className="mt-2 text-sm text-zinc-600">
              We've received your enquiry about <strong>{product.name}</strong>{" "}
              and will reply within one business day.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, portalTarget);
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  textarea?: boolean;
}) {
  const baseCls =
    "block w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 transition-colors focus:border-zinc-950 focus:outline-none focus:ring-0";
  return (
    <label className="block">
      <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
        {label}
        {required && <span className="ml-1 text-zinc-400">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          required={required}
          defaultValue={defaultValue}
          rows={4}
          className={cn(baseCls, "mt-2 resize-none")}
        />
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue}
          className={cn(baseCls, "mt-2")}
        />
      )}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Local share icon (lucide-react@1.16 doesn't ship Share2)
// ─────────────────────────────────────────────────────────────────────────────

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
