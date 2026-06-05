"use client";

import { useState } from "react";
import { ImagePlus, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MediaPicker } from "@/components/admin/media-picker";
import type { ProductOption, ProductVariant } from "@/types";

function publicUrl(key: string): string {
  if (!key) return "";
  if (/^https?:\/\//i.test(key)) return key;
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ?? "";
  if (!base) return key;
  return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}

const OPTION_SUGGESTIONS = ["Color", "Size", "Material", "Finish"];
const MAX_OPTIONS = 3;
const MAX_COMBOS = 100;

// ─────────────────────────────────────────────────────────────────────────────
// State model
// ─────────────────────────────────────────────────────────────────────────────

type EditorValue = { key: string; name: string; swatchImage: string };
type EditorOption = { key: string; name: string; values: EditorValue[] };

/** Per-combination data, keyed by the joined value names. */
type ComboData = {
  sku: string;
  priceRupees: string;
  inStock: boolean;
  images: string[];
};

const EMPTY_COMBO: ComboData = {
  sku: "",
  priceRupees: "",
  inStock: true,
  images: [],
};

let _k = 0;
const nextKey = () => `k${++_k}`;

const comboKey = (values: string[]) => values.join("||");

/** Cartesian product of the option value-name lists. */
function cartesian(groups: string[][]): string[][] {
  if (groups.length === 0) return [];
  return groups.reduce<string[][]>(
    (acc, g) => acc.flatMap((combo) => g.map((v) => [...combo, v])),
    [[]],
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Editor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shopify-style variants editor.
 *  1. Define option groups (Color → Red, Black · Size → S, M).
 *  2. Every combination (Red / S, Red / M, …) is generated automatically and
 *     gets its own SKU, price override, stock flag and image gallery.
 * Serialises `{ options, variants }` into one hidden `variantsJson` input.
 */
export function VariantsEditor({
  defaultOptions = [],
  defaultVariants = [],
}: {
  defaultOptions?: ProductOption[];
  defaultVariants?: ProductVariant[];
}) {
  const [options, setOptions] = useState<EditorOption[]>(() =>
    defaultOptions.map((o) => ({
      key: nextKey(),
      name: o.name,
      values: o.values.map((v) => ({
        key: nextKey(),
        name: v.name,
        swatchImage: v.swatchImage ?? "",
      })),
    })),
  );

  // Saved per-combination data survives option edits — combos are re-matched
  // by their joined value names.
  const [comboData, setComboData] = useState<Record<string, ComboData>>(() => {
    const map: Record<string, ComboData> = {};
    for (const v of defaultVariants) {
      map[comboKey(v.optionValues)] = {
        sku: v.sku ?? "",
        priceRupees:
          v.pricePaise != null ? (v.pricePaise / 100).toFixed(2) : "",
        inStock: v.inStock,
        images: v.images,
      };
    }
    return map;
  });

  // ── Derived combinations ──
  const activeGroups = options
    .map((o) => o.values.map((v) => v.name.trim()).filter(Boolean))
    .filter((g) => g.length > 0);
  const combos =
    activeGroups.length === options.filter((o) => o.values.length > 0).length
      ? cartesian(activeGroups).slice(0, MAX_COMBOS)
      : [];
  const truncated = cartesian(activeGroups).length > MAX_COMBOS;

  const patchCombo = (key: string, p: Partial<ComboData>) =>
    setComboData((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? EMPTY_COMBO), ...p },
    }));

  // ── Option mutations ──
  const addOption = (name = "") =>
    setOptions((prev) =>
      prev.length >= MAX_OPTIONS
        ? prev
        : [...prev, { key: nextKey(), name, values: [] }],
    );

  const patchOption = (key: string, p: Partial<Pick<EditorOption, "name">>) =>
    setOptions((prev) =>
      prev.map((o) => (o.key === key ? { ...o, ...p } : o)),
    );

  const removeOption = (key: string) =>
    setOptions((prev) => prev.filter((o) => o.key !== key));

  const addValue = (optionKey: string, raw: string) => {
    const name = raw.trim();
    if (!name) return;
    setOptions((prev) =>
      prev.map((o) => {
        if (o.key !== optionKey) return o;
        if (o.values.some((v) => v.name.toLowerCase() === name.toLowerCase()))
          return o;
        return {
          ...o,
          values: [...o.values, { key: nextKey(), name, swatchImage: "" }],
        };
      }),
    );
  };

  const removeValue = (optionKey: string, valueKey: string) =>
    setOptions((prev) =>
      prev.map((o) =>
        o.key === optionKey
          ? { ...o, values: o.values.filter((v) => v.key !== valueKey) }
          : o,
      ),
    );

  const setSwatch = (optionKey: string, valueKey: string, swatchImage: string) =>
    setOptions((prev) =>
      prev.map((o) =>
        o.key === optionKey
          ? {
              ...o,
              values: o.values.map((v) =>
                v.key === valueKey ? { ...v, swatchImage } : v,
              ),
            }
          : o,
      ),
    );

  // ── Serialisation ──
  const payload = {
    options: options
      .filter((o) => o.name.trim() && o.values.length > 0)
      .map((o) => ({
        name: o.name.trim(),
        values: o.values.map((v) => ({
          name: v.name,
          swatchImage: v.swatchImage || null,
        })),
      })),
    variants: combos.map((values) => {
      const data = comboData[comboKey(values)] ?? EMPTY_COMBO;
      return { optionValues: values, ...data };
    }),
  };

  return (
    <div className="space-y-6">
      <input
        type="hidden"
        name="variantsJson"
        value={JSON.stringify(payload)}
      />

      {/* ── Options builder ── */}
      <div className="space-y-3">
        {options.length === 0 && (
          <p className="border-border text-muted-foreground rounded-xl border border-dashed px-4 py-6 text-center text-xs">
            No options. Add one (e.g. Color, Size) — every combination of the
            values becomes a variant below, Shopify-style.
          </p>
        )}

        {options.map((option) => (
          <OptionRow
            key={option.key}
            option={option}
            onName={(name) => patchOption(option.key, { name })}
            onAddValue={(v) => addValue(option.key, v)}
            onRemoveValue={(vk) => removeValue(option.key, vk)}
            onSwatch={(vk, img) => setSwatch(option.key, vk, img)}
            onRemove={() => removeOption(option.key)}
          />
        ))}

        {options.length < MAX_OPTIONS && (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addOption()}
            >
              <Plus className="size-3.5" />
              Add option
            </Button>
            {OPTION_SUGGESTIONS.filter(
              (s) =>
                !options.some(
                  (o) => o.name.trim().toLowerCase() === s.toLowerCase(),
                ),
            )
              .slice(0, 4)
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addOption(s)}
                  className="text-muted-foreground hover:text-foreground hover:bg-accent border-border rounded-full border px-2.5 py-1 text-[11px] transition-colors"
                >
                  {s}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* ── Generated combinations ── */}
      {combos.length > 0 && (
        <div className="border-border overflow-hidden rounded-xl border">
          <div className="border-border bg-muted/30 flex items-center justify-between border-b px-4 py-2.5">
            <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
              Variants
            </span>
            <span className="text-muted-foreground text-xs tabular-nums">
              {combos.length} {combos.length === 1 ? "combination" : "combinations"}
              {truncated && ` (capped at ${MAX_COMBOS})`}
            </span>
          </div>
          <ul className="divide-border divide-y">
            {combos.map((values) => {
              const key = comboKey(values);
              const data = comboData[key] ?? EMPTY_COMBO;
              return (
                <li key={key} className="space-y-2.5 px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-foreground min-w-28 flex-1 text-sm font-medium tracking-tight">
                      {values.join(" / ")}
                    </span>
                    <Input
                      value={data.sku}
                      onChange={(e) => patchCombo(key, { sku: e.target.value })}
                      placeholder="SKU"
                      className="h-9 w-32 font-mono text-xs"
                      autoComplete="off"
                    />
                    <div className="relative w-32">
                      <span className="text-muted-foreground absolute top-1/2 left-2.5 -translate-y-1/2 text-xs">
                        ₹
                      </span>
                      <Input
                        value={data.priceRupees}
                        onChange={(e) =>
                          patchCombo(key, { priceRupees: e.target.value })
                        }
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="Product price"
                        title="Leave blank to use the product price"
                        className="h-9 pl-6 text-sm"
                      />
                    </div>
                    <label className="text-foreground/80 flex shrink-0 cursor-pointer items-center gap-1.5 text-xs">
                      <Checkbox
                        checked={data.inStock}
                        onCheckedChange={(c) =>
                          patchCombo(key, { inStock: c === true })
                        }
                      />
                      In stock
                    </label>
                  </div>
                  <VariantImages
                    images={data.images}
                    onChange={(images) => patchCombo(key, { images })}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Option row — name + value chips (each chip can carry a swatch image).
// ─────────────────────────────────────────────────────────────────────────────

function OptionRow({
  option,
  onName,
  onAddValue,
  onRemoveValue,
  onSwatch,
  onRemove,
}: {
  option: EditorOption;
  onName: (name: string) => void;
  onAddValue: (value: string) => void;
  onRemoveValue: (valueKey: string) => void;
  onSwatch: (valueKey: string, swatchImage: string) => void;
  onRemove: () => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    if (draft.trim()) {
      onAddValue(draft);
      setDraft("");
    }
  };

  return (
    <div className="border-border bg-background space-y-3 rounded-xl border p-3">
      <div className="flex items-center gap-2">
        <Input
          value={option.name}
          onChange={(e) => onName(e.target.value)}
          placeholder="Option name (e.g. Color)"
          className="h-9 max-w-56 text-sm"
          autoComplete="off"
          list="variant-option-suggestions"
        />
        <datalist id="variant-option-suggestions">
          {OPTION_SUGGESTIONS.map((o) => (
            <option key={o} value={o} />
          ))}
        </datalist>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove option"
          className="text-muted-foreground hover:text-destructive ml-auto grid size-7 place-items-center rounded-md transition-colors"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {option.values.map((v) => (
          <ValueChip
            key={v.key}
            value={v}
            onRemove={() => onRemoveValue(v.key)}
            onSwatch={(img) => onSwatch(v.key, img)}
          />
        ))}

        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={commit}
          placeholder={
            option.values.length === 0
              ? "Type a value and press Enter (e.g. Red)"
              : "Add value…"
          }
          className="placeholder:text-muted-foreground/60 h-8 min-w-44 flex-1 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function ValueChip({
  value,
  onRemove,
  onSwatch,
}: {
  value: EditorValue;
  onRemove: () => void;
  onSwatch: (swatchImage: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <span className="border-border bg-muted/40 inline-flex items-center gap-1.5 rounded-full border py-1 pr-1.5 pl-1.5 text-sm">
      {/* Swatch circle — click to set / change, × inside removes the swatch */}
      {value.swatchImage ? (
        <button
          type="button"
          onClick={() => onSwatch("")}
          title="Remove swatch image"
          className="group/sw ring-border relative size-6 shrink-0 overflow-hidden rounded-full ring-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={publicUrl(value.swatchImage)}
            alt=""
            className="size-full object-cover"
          />
          <span className="absolute inset-0 grid place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover/sw:opacity-100">
            <X className="size-3" />
          </span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          title="Add a swatch image (shown as the option button on the storefront)"
          className="border-input text-muted-foreground hover:bg-accent grid size-6 shrink-0 place-items-center rounded-full border border-dashed transition-colors"
        >
          <ImagePlus className="size-3" />
        </button>
      )}

      <span className="text-foreground/90">{value.name}</span>

      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${value.name}`}
        className="text-muted-foreground hover:text-destructive grid size-5 place-items-center rounded-full transition-colors"
      >
        <X className="size-3" />
      </button>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onPick={(keys) => keys[0] && onSwatch(keys[0])}
        type="image"
        folder="products"
      />
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-combination image strip — the add tile opens the media library, which
// covers both picking existing files and uploading new ones.
// ─────────────────────────────────────────────────────────────────────────────

function VariantImages({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      {images.map((key, idx) => (
        <span
          key={key}
          className="ring-border/60 group/img relative size-10 shrink-0 overflow-hidden rounded-lg ring-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={publicUrl(key)} alt="" className="size-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(images.filter((_, i) => i !== idx))}
            aria-label="Remove image"
            className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition-opacity group-hover/img:opacity-100"
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={() => setLibraryOpen(true)}
        className="border-input text-muted-foreground hover:bg-accent flex size-10 shrink-0 items-center justify-center rounded-lg border border-dashed transition-colors"
        title="Add images for this combination. Empty = product gallery is used."
      >
        <ImagePlus className="size-3.5" />
      </button>

      {images.length === 0 && (
        <span className="text-muted-foreground/70 text-[11px]">
          No images — the product gallery will be shown.
        </span>
      )}

      <MediaPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onPick={(keys) =>
          onChange([...images, ...keys.filter((k) => !images.includes(k))])
        }
        multiple
        type="image"
        folder="products"
      />
    </div>
  );
}
