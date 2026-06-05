"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { ArrowRight, Check, ChevronRight, X } from "lucide-react";
import type { ProductDetail } from "@/lib/services/storefront/product-detail.service";
// Type-only import — erased at compile time, so no runtime cycle with ProductView.
import type { VariantState } from "@/components/storefront/Product/ProductView";
import { submitEnquiryAction } from "@/app/(storefront)/products/actions";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { cn } from "@/lib/utils";

type Props = {
  product: ProductDetail;
  /** Variant option groups + selection — owned by ProductView so the gallery stays in sync. */
  variantState?: VariantState;
};

function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(paise / 100);
}

export default function ProductInfo({ product, variantState }: Props) {
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const hasVariants = (variantState?.options.length ?? 0) > 0;

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

      {/* Variant options — one selector row per option (Color, Size…). The
          chosen values resolve to one generated combination, Shopify-style. */}
      {hasVariants && variantState && (
        <div className="mt-8 space-y-6">
          {variantState.options.map((option) => {
            const selectedName = variantState.selections[option.name];
            return (
              <div key={option.name}>
                <h3 className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
                  {option.name}
                  {selectedName && (
                    <span className="ml-2 normal-case tracking-normal text-zinc-900">
                      {selectedName}
                    </span>
                  )}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-2.5">
                  {option.values.map((v) => {
                    const active = v.name === selectedName;
                    const available = variantState.isValueAvailable(
                      option.name,
                      v.name,
                    );
                    // Image swatch when the admin set one; text pill otherwise.
                    if (v.swatchUrl) {
                      return (
                        <button
                          key={v.name}
                          type="button"
                          onClick={() =>
                            variantState.select(option.name, v.name)
                          }
                          aria-pressed={active}
                          aria-label={v.name}
                          title={
                            available ? v.name : `${v.name} — unavailable`
                          }
                          className={cn(
                            "relative size-12 overflow-hidden rounded-full ring-2 ring-offset-2 transition-all duration-200",
                            active
                              ? "ring-zinc-950"
                              : "ring-zinc-200 hover:ring-zinc-400",
                            !available && "opacity-45",
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={v.swatchUrl}
                            alt={v.name}
                            className="size-full object-cover"
                          />
                          {!available && (
                            <span
                              aria-hidden
                              className="absolute inset-0 grid place-items-center"
                            >
                              <span className="h-px w-full rotate-45 bg-zinc-500" />
                            </span>
                          )}
                        </button>
                      );
                    }
                    return (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() => variantState.select(option.name, v.name)}
                        aria-pressed={active}
                        title={available ? v.name : `${v.name} — unavailable`}
                        className={cn(
                          "rounded-full border px-4 py-2 text-sm tracking-tight transition-colors duration-200",
                          active
                            ? "border-zinc-950 bg-zinc-950 text-white"
                            : "border-zinc-300 text-zinc-700 hover:border-zinc-900 hover:text-zinc-950",
                          !available && !active && "text-zinc-400 line-through",
                        )}
                      >
                        {v.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Effective price / availability for the current combination */}
          <p className="text-sm text-zinc-600">
            {variantState.pricePaise != null ? (
              <span className="text-base font-medium tracking-tight text-zinc-950 tabular-nums">
                {formatINR(variantState.pricePaise)}
              </span>
            ) : (
              <span>Price on request</span>
            )}
            {!variantState.inStock && (
              <span className="ml-3 text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
                Out of stock
              </span>
            )}
            {variantState.selectedVariant?.sku && (
              <span className="ml-3 font-mono text-[11px] text-zinc-400">
                SKU {variantState.selectedVariant.sku}
              </span>
            )}
          </p>
        </div>
      )}

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

      {/* Enquiry dialog — stays mounted so open/close can transition */}
      <EnquiryDialog
        product={product}
        variantName={variantState?.label ?? null}
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Enquiry dialog (modal)
// ─────────────────────────────────────────────────────────────────────────────

const CLOSE_MS = 400;

function EnquiryDialog({
  product,
  variantName,
  open,
  onClose,
}: {
  product: ProductDetail;
  variantName: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  // Body scroll lock + Escape — only while open.
  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  // Close, then reset the form once the exit transition has finished.
  const handleClose = () => {
    onClose();
    window.setTimeout(() => {
      setSubmitted(false);
      setError(null);
      formRef.current?.reset();
    }, CLOSE_MS);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);

    const res = await submitEnquiryAction({
      productId: product.id,
      productName: variantName
        ? `${product.name} — ${variantName}`
        : product.name,
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      countryCode: String(fd.get("countryCode") ?? "+91"),
      phone: String(fd.get("phone") ?? ""),
      message: String(fd.get("message") ?? ""),
      sourceUrl: window.location.href,
    });

    setSubmitting(false);
    if ("error" in res) setError(res.error);
    else setSubmitted(true);
  };

  if (!portalTarget) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
      className={cn("fixed inset-0 z-[110]", !open && "pointer-events-none")}
    >
      {/* Backdrop — fades */}
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={handleClose}
        style={{
          transitionProperty: "opacity",
          transitionDuration: "300ms",
          transitionTimingFunction: "ease-out",
          opacity: open ? 1 : 0,
        }}
        className={cn(
          "absolute inset-0 bg-zinc-950/60 backdrop-blur-sm",
          !open && "pointer-events-none",
        )}
      />

      {/* Panel — slides up + fades */}
      <div className="pointer-events-none absolute inset-0 grid place-items-end sm:place-items-center sm:p-4">
        <div
          style={{
            transitionProperty: "opacity, translate",
            transitionDuration: "400ms",
            transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
            opacity: open ? 1 : 0,
            translate: open ? "0 0" : "0 2rem",
          }}
          className={cn(
            "max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-[0_24px_64px_-24px_rgba(0,0,0,0.5)] sm:rounded-2xl sm:p-8",
            // pointer-events must follow `open` — a hardcoded `auto` would
            // override the closed container and invisibly block the page.
            open ? "pointer-events-auto" : "pointer-events-none",
          )}
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
                    {variantName && (
                      <span className="text-zinc-500"> — {variantName}</span>
                    )}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
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

              <form ref={formRef} onSubmit={onSubmit} className="mt-6 space-y-4">
                <Field label="Your name" name="name" required />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Email" name="email" type="email" required />

                  {/* Phone with country code */}
                  <label className="block">
                    <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                      Phone
                    </span>
                    <div className="mt-2 flex">
                      <select
                        name="countryCode"
                        defaultValue="+91"
                        aria-label="Country code"
                        className="shrink-0 rounded-l-lg border border-r-0 border-zinc-300 bg-zinc-50 px-2 py-2.5 text-sm text-zinc-900 transition-colors focus:border-zinc-950 focus:outline-none focus:ring-0"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel-national"
                        placeholder="98765 43210"
                        className="block w-full min-w-0 rounded-r-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 transition-colors placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-0"
                      />
                    </div>
                  </label>
                </div>
                <Field
                  // Re-key on variant so the prefilled text follows the selection.
                  key={variantName ?? "default"}
                  label="Message"
                  name="message"
                  textarea
                  defaultValue={`Hi — I'd like to enquire about the ${product.name}${variantName ? ` (${variantName})` : ""}.`}
                  required
                />

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
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
                onClick={handleClose}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
          )}
        </div>
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
    "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 transition-colors placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-0";
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
