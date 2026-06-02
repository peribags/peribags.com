"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ProductDetail } from "@/lib/product-detail";
import { cn } from "@/lib/utils";
import { siteConfig, mailHref } from "@/lib/site";

type DetailId = "description" | "specifications" | "care" | "shipping";

type Props = {
  product: ProductDetail;
};

export default function ProductDetails({ product }: Props) {
  const [open, setOpen] = useState<DetailId | null>("description");
  const toggle = (id: DetailId) =>
    setOpen((prev) => (prev === id ? null : id));

  return (
    <div className="divide-y divide-zinc-200 border-y border-zinc-200">
      <Section
        title="Description"
        isOpen={open === "description"}
        onToggle={() => toggle("description")}
      >
        <div className="space-y-4 text-sm leading-relaxed text-zinc-700 sm:text-base">
          {product.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </Section>

      <Section
        title="Specifications"
        isOpen={open === "specifications"}
        onToggle={() => toggle("specifications")}
      >
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {product.specs.map((s) => (
            <div
              key={s.label}
              className="flex items-baseline justify-between gap-3 border-b border-zinc-100 py-2.5 sm:border-none sm:py-0"
            >
              <dt className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                {s.label}
              </dt>
              <dd className="text-right text-sm text-zinc-900 sm:text-left">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section
        title="Care & repair"
        isOpen={open === "care"}
        onToggle={() => toggle("care")}
      >
        <ul className="space-y-3 text-sm leading-relaxed text-zinc-700">
          {product.care.map((c, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-2 block size-1 shrink-0 rounded-full bg-zinc-400" />
              {c}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-zinc-500">
          Every Perry Bag comes with lifetime repairs. If something needs
          attention, write to us at{" "}
          <a
            href={mailHref(siteConfig.email)}
            className="underline underline-offset-4 hover:text-zinc-950"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      </Section>

      <Section
        title="Shipping & enquiry"
        isOpen={open === "shipping"}
        onToggle={() => toggle("shipping")}
      >
        <ul className="space-y-3 text-sm leading-relaxed text-zinc-700">
          <li className="flex gap-3">
            <span className="mt-2 block size-1 shrink-0 rounded-full bg-zinc-400" />
            We&apos;re a catalogue brand — every order begins with an enquiry. Use
            the button on the right to send us your details.
          </li>
          <li className="flex gap-3">
            <span className="mt-2 block size-1 shrink-0 rounded-full bg-zinc-400" />
            Pan-India delivery in 3–5 business days. International on request.
          </li>
          <li className="flex gap-3">
            <span className="mt-2 block size-1 shrink-0 rounded-full bg-zinc-400" />
            Free returns within 14 days, original condition.
          </li>
        </ul>
      </Section>
    </div>
  );
}

function Section({
  title,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 py-5 text-left transition-colors hover:text-zinc-950 sm:py-6"
      >
        <span className="text-base font-medium tracking-tight text-zinc-950 sm:text-lg">
          {title}
        </span>
        <ChevronDown
          className={cn(
            "size-4 text-zinc-500 transition-transform duration-300",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
          isOpen
            ? "grid-rows-[1fr] pb-6 opacity-100 sm:pb-8"
            : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
