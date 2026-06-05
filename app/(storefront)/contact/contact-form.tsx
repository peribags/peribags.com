"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { submitEnquiryAction } from "@/app/(storefront)/products/actions";
import { COUNTRY_CODES } from "@/lib/country-codes";
import { cn } from "@/lib/utils";

const inputCls =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-950 transition-colors placeholder:text-zinc-400 focus:border-zinc-950 focus:outline-none focus:ring-0";

/**
 * General contact form — feeds the same enquiry pipeline as product pages
 * (enquiries table + admin inbox + notification/acknowledgment emails),
 * just without a product attached.
 */
export function ContactForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSubmitting(true);
    setError(null);

    const res = await submitEnquiryAction({
      productId: null,
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

  if (submitted) {
    return (
      <div className="py-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <h3 className="mt-5 text-xl font-medium tracking-tight text-zinc-950">
          Thanks — we&apos;ll be in touch.
        </h3>
        <p className="mt-2 text-sm text-zinc-600">
          We&apos;ve received your message and will reply within one business
          day.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setError(null);
            formRef.current?.reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 transition-colors hover:border-zinc-900"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      {/* Two columns — details left, message right */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-4">
          <Field label="Your name" required>
            <input
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Full name"
              className={inputCls}
            />
          </Field>

          <Field label="Email" required>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </Field>

          <Field label="Phone">
            <div className="flex">
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
                className={cn(inputCls, "min-w-0 rounded-l-none border-l-0")}
              />
            </div>
          </Field>
        </div>

        {/* Message stretches the full height of the left stack */}
        <Field label="Message" required stretch>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Tell us what you're looking for — a product, a bulk order, or anything else…"
            className={cn(inputCls, "h-full min-h-32 resize-none")}
          />
        </Field>
      </div>

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
        {submitting ? "Sending…" : "Send message"}
        {!submitting && <ArrowRight className="size-4" />}
      </button>

      <p className="text-center text-xs text-zinc-400">
        We reply within one business day.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  stretch,
  children,
}: {
  label: string;
  required?: boolean;
  /** Make the control fill the remaining height (e.g. a column-tall textarea). */
  stretch?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", stretch && "flex h-full flex-col")}>
      <span className="block text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
        {label}
        {required && <span className="ml-1 text-zinc-400">*</span>}
      </span>
      <div className={cn("mt-2", stretch && "flex-1")}>{children}</div>
    </label>
  );
}
