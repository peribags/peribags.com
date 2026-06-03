"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, X } from "lucide-react";
import type { ProductDetail } from "@/lib/services/storefront/product-detail.service";
import { cn } from "@/lib/utils";

type Props = {
  product: ProductDetail;
};

export default function ProductInfo({ product }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const onShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const data = {
      title: product.name,
      text: product.shortDescription ?? "",
      url,
    };
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
      {/* {product.category && (
        <Link
          href={`/category/${product.category.slug}` as never}
          className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500 hover:text-zinc-950"
        >
          {product.category.name}
          <ChevronRight className="size-3" />
        </Link>
      )} */}

      {/* Title */}
      <h1
        className={cn(
          "text-2xl md:text-3xl font-medium tracking-tight text-zinc-950 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.05]",
          product.category && "mt-0",
        )}
      >
        {product.name}
      </h1>

      {/* Specifications — 2-col tiles */}
      {product.specs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
            Specifications
          </h3>
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {product.specs.map((s, i) => (
              <li
                key={`${s.label}-${i}`}
                className="rounded-md border border-zinc-200 px-4 py-3"
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                  {s.label}
                </p>
                {s.value && (
                  <p className="mt-1.5 text-sm font-light leading-snug text-zinc-900">
                    {s.value}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Short description — below specifications */}
      {product.shortDescription && (
        <p className="mt-8 text-sm font-light leading-relaxed text-zinc-600">
          {product.shortDescription}
        </p>
      )}

      {/* CTAs */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => setEnquiryOpen(true)}
          className="group/cta inline-flex items-center rounded-full justify-center gap-2 bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white hover:gap-3 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
        >
          <SendIcon className="size-4" />
          Enquire now
        </button>
        <button
          type="button"
          onClick={onShare}
          className="inline-flex items-center rounded-full justify-center gap-2 border border-zinc-300 px-6 py-3.5 text-sm font-medium tracking-tight text-zinc-900 hover:border-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:ring-offset-2"
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

      {/* Enquiry dialog */}
      {enquiryOpen && (
        <EnquiryDialog
          product={product}
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
  onClose,
}: {
  product: ProductDetail;
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
                className="grid size-9 place-items-center rounded-full text-zinc-900 hover:bg-zinc-100"
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
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone" name="phone" type="tel" />
              </div>
              <Field
                label="Message"
                name="message"
                textarea
                defaultValue={`Hi — I'd like to enquire about the ${product.name}.`}
                required
              />

              <input
                type="hidden"
                name="product_id"
                value={product.id}
              />
              <input
                type="hidden"
                name="product_slug"
                value={product.slug}
              />

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
              className="mt-6 inline-flex items-center justify-center bg-zinc-950 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-800"
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
    "block w-full border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 focus:border-zinc-950 focus:outline-none focus:ring-0";
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

function SendIcon({ className }: { className?: string }) {
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
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}
