"use client";

import { useState } from "react";
import ProductGallery from "@/components/storefront/Product/ProductGallery";
import ProductInfo from "@/components/storefront/Product/ProductInfo";
import ProductDetails from "@/components/storefront/Product/ProductDetails";
import type {
  ProductDetail,
  ProductDetailOption,
  ProductDetailVariant,
} from "@/lib/services/storefront/product-detail.service";

export type VariantState = {
  /** Option groups (Color, Size, …) with their values. */
  options: ProductDetailOption[];
  /** option name → selected value name */
  selections: Record<string, string>;
  select: (optionName: string, valueName: string) => void;
  /**
   * Whether picking this value (keeping the other selections) resolves to an
   * in-stock combination — used to grey out dead ends, Shopify-style.
   */
  isValueAvailable: (optionName: string, valueName: string) => boolean;
  /** The matching combination for the current selection, if it exists. */
  selectedVariant: ProductDetailVariant | null;
  /** "Red / S" */
  label: string | null;
  /** Effective price (combination override or product price). */
  pricePaise: number | null;
  inStock: boolean;
};

/**
 * Client shell for the product page's main columns. Owns the option
 * selections (Shopify-style: the chosen values resolve to one generated
 * combination) so the gallery and info panel stay in sync.
 */
export default function ProductView({ product }: { product: ProductDetail }) {
  const options = product.options;
  const variants = product.variants;

  const [selections, setSelections] = useState<Record<string, string>>(() => {
    // Prefer the first in-stock combination; fall back to the first
    // combination, then to each option's first value.
    const seed = variants.find((v) => v.inStock) ?? variants[0] ?? null;
    const initial: Record<string, string> = {};
    options.forEach((o, i) => {
      initial[o.name] = seed?.optionValues[i] ?? o.values[0]?.name ?? "";
    });
    return initial;
  });

  const select = (optionName: string, valueName: string) =>
    setSelections((prev) => ({ ...prev, [optionName]: valueName }));

  const selectedNames = options.map((o) => selections[o.name] ?? "");

  const matches = (v: ProductDetailVariant, names: string[]) =>
    names.length === v.optionValues.length &&
    v.optionValues.every((x, i) => x === names[i]);

  const selectedVariant =
    variants.find((v) => matches(v, selectedNames)) ?? null;

  const isValueAvailable = (optionName: string, valueName: string) => {
    const idx = options.findIndex((o) => o.name === optionName);
    if (idx === -1) return true;
    const candidate = selectedNames.slice();
    candidate[idx] = valueName;
    return variants.some((v) => v.inStock && matches(v, candidate));
  };

  const gallery =
    selectedVariant && selectedVariant.gallery.length > 0
      ? selectedVariant.gallery
      : product.gallery;

  const pricePaise = selectedVariant?.pricePaise ?? product.pricePaise;

  const inStock =
    options.length === 0
      ? product.inStock
      : selectedVariant
        ? selectedVariant.inStock
        : false; // selection doesn't resolve to an existing combination

  const variantState: VariantState = {
    options,
    selections,
    select,
    isValueAvailable,
    selectedVariant,
    label: selectedVariant?.title ?? null,
    pricePaise,
    inStock,
  };

  return (
    <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-10 md:mt-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)] lg:gap-x-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)]">
      {/* Gallery — sticky on lg so it stays put while right column scrolls.
          Keyed so switching combinations replays the gallery cleanly. */}
      <div className="min-w-0 lg:sticky lg:top-6 lg:self-start">
        {gallery.length > 0 ? (
          <ProductGallery
            key={
              selectedVariant && selectedVariant.gallery.length > 0
                ? selectedVariant.id
                : "default"
            }
            images={gallery}
            alt={
              selectedVariant
                ? `${product.name} — ${selectedVariant.title}`
                : product.name
            }
          />
        ) : (
          <div
            className="aspect-[4/5] w-full"
            style={{ backgroundColor: "#F5F1EA" }}
          />
        )}
      </div>

      {/* Right column: info + details accordion */}
      <div className="min-w-0">
        <ProductInfo product={product} variantState={variantState} />

        <div className="mt-10">
          <ProductDetails product={product} />
        </div>
      </div>
    </div>
  );
}
