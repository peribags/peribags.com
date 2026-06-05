"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageGalleryUpload } from "@/components/admin/image-gallery-upload";
import { RichEditor } from "@/components/admin/rich-editor";
import { SpecsEditor } from "@/components/admin/specs-editor";
import { VariantsEditor } from "@/components/admin/variants-editor";
import { cn, slugify } from "@/lib/utils";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "./actions";
import type { Product } from "@/types";

export type CategoryChoice = {
  id: string;
  name: string;
  depth: number;
};

type Props =
  | {
      mode: "create";
      product?: undefined;
      categoryChoices: CategoryChoice[];
    }
  | {
      mode: "edit";
      product: Product;
      categoryChoices: CategoryChoice[];
    };

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      <Save className="size-4" />
      {pending
        ? mode === "create"
          ? "Creating…"
          : "Saving…"
        : mode === "create"
          ? "Create product"
          : "Save changes"}
    </Button>
  );
}

export function ProductForm(props: Props) {
  const action =
    props.mode === "create" ? createProductAction : updateProductAction;

  const [state, formAction] = useActionState<ProductFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Saved");
  }, [state]);

  const p = props.mode === "edit" ? props.product : null;

  const [name, setName] = useState(p?.name ?? "");
  const [slug, setSlug] = useState(p?.slug ?? "");
  const slugTouched = useRef<boolean>(!!p?.slug);

  useEffect(() => {
    if (!slugTouched.current) setSlug(slugify(name));
  }, [name]);

  const initialPriceRupees =
    p?.pricePaise != null ? (p.pricePaise / 100).toFixed(2) : "";

  const [metaTitle, setMetaTitle] = useState(p?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    p?.metaDescription ?? "",
  );

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(p?.categoryIds ?? []),
  );

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <form action={formAction} className="space-y-10">
      {props.mode === "edit" && (
        <input type="hidden" name="id" value={p!.id} />
      )}
      {[...selectedCategories].map((id) => (
        <input key={id} type="hidden" name="categoryIds" value={id} />
      ))}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-10">
          <Section
            kicker="Identity"
            title="Basics"
            description="The name customers see and the slug used in the URL."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field htmlFor="name" label="Name" required>
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="Classic Leather Tote"
                  className="h-11"
                />
              </Field>

              <Field
                htmlFor="slug"
                label="Slug"
                hint="Lowercase, hyphens. Auto-numbered if it collides."
              >
                <Input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    setSlug(e.target.value);
                  }}
                  pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
                  title="Lowercase letters, numbers, and hyphens"
                  placeholder="auto-from-name"
                  autoComplete="off"
                  className="h-11 font-mono text-sm"
                />
              </Field>
            </div>

            <Field
              htmlFor="shortDescription"
              label="Short description"
              hint="One line. Shown on product cards in lists."
            >
              <Textarea
                id="shortDescription"
                name="shortDescription"
                defaultValue={p?.shortDescription ?? ""}
                rows={2}
                placeholder="A handcrafted everyday tote in full-grain leather."
              />
            </Field>

            <Field
              htmlFor="description"
              label="Description"
              hint="Long-form description for the product detail page. Supports headings, lists, links."
            >
              <RichEditor
                name="description"
                defaultValue={p?.description ?? ""}
                placeholder="Tell the story — materials, craftsmanship, dimensions, care…"
              />
            </Field>
          </Section>

          <Section
            kicker="Gallery"
            title="Images"
            description="First image is the hero. Drag order with the arrows; remove with the × handle."
          >
            <ImageGalleryUpload
              name="images"
              defaultValue={p?.images ?? []}
              folder="products"
            />
          </Section>

          <Section
            kicker="Options"
            title="Variants"
            description="Define options like Color (Red, Black) and Size (S, M) — every combination (Red / S, Red / M, …) is generated automatically with its own SKU, price, stock and images. Add a swatch image to a value to show it as an image button on the storefront."
          >
            <VariantsEditor
              defaultOptions={p?.options ?? []}
              defaultVariants={p?.variants ?? []}
            />
          </Section>

          <Section
            kicker="Details"
            title="Specifications"
            description="Free-form attribute rows. Empty rows are dropped on save; order is preserved."
          >
            <SpecsEditor defaultValue={p?.specs ?? []} />
          </Section>

          <Section
            kicker="SEO"
            title="Search & social"
            description="How this product appears in Google results and link previews. Both fields are optional — name and short description are used as fallbacks."
          >
            <Field
              htmlFor="metaTitle"
              label="Meta title"
              hint={`${metaTitle.length}/60 characters · keep it under 60 for full visibility in Google.`}
            >
              <Input
                id="metaTitle"
                name="metaTitle"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                maxLength={120}
                placeholder={p?.name || "Classic Leather Tote · PERI"}
                className="h-11"
                autoComplete="off"
              />
            </Field>

            <Field
              htmlFor="metaDescription"
              label="Meta description"
              hint={`${metaDescription.length}/160 characters · Google typically shows the first ~155.`}
            >
              <Textarea
                id="metaDescription"
                name="metaDescription"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                maxLength={320}
                rows={3}
                placeholder="Handcrafted full-grain leather tote, made in India. Spacious interior, adjustable strap…"
              />
            </Field>
          </Section>

          {state && "error" in state && (
            <div
              role="alert"
              className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm"
            >
              <span className="bg-destructive/15 text-destructive grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold">
                !
              </span>
              <span className="leading-relaxed">{state.error}</span>
            </div>
          )}

          {state && "ok" in state && state.ok && (
            <div className="border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>Changes saved.</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <SubmitButton mode={props.mode} />
          </div>
        </div>

        {/* ───────────── Sidebar ───────────── */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <SidebarSection title="Pricing">
            <Field
              htmlFor="priceRupees"
              label="Price (₹)"
              hint="Leave blank to show ‘Price on request’ on the storefront."
            >
              <div className="relative">
                <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                  ₹
                </span>
                <Input
                  id="priceRupees"
                  name="priceRupees"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={initialPriceRupees}
                  inputMode="decimal"
                  placeholder="Price on request"
                  className="h-11 pl-7"
                />
              </div>
            </Field>
          </SidebarSection>

          <SidebarSection title="Visibility">
            <ToggleRow
              name="published"
              label="Published"
              hint="When off, hidden from the storefront."
              defaultChecked={p?.published ?? false}
            />
            <ToggleRow
              name="featured"
              label="Featured"
              hint="Highlight on home / curated strips."
              defaultChecked={p?.featured ?? false}
            />
            <ToggleRow
              name="inStock"
              label="In stock"
              hint="Marks availability for buyers."
              defaultChecked={p?.inStock ?? true}
            />
          </SidebarSection>

          <SidebarSection
            title={`Categories${selectedCategories.size ? ` · ${selectedCategories.size}` : ""}`}
          >
            {props.categoryChoices.length === 0 ? (
              <p className="text-muted-foreground text-xs">
                No categories yet. Create some under{" "}
                <span className="text-foreground font-medium">
                  /admin/category
                </span>{" "}
                first.
              </p>
            ) : (
              <div className="border-border max-h-72 overflow-y-auto rounded-lg border">
                <ul className="divide-border divide-y">
                  {props.categoryChoices.map((c) => {
                    const checked = selectedCategories.has(c.id);
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "hover:bg-accent/50 transition-colors",
                          checked && "bg-accent/40",
                        )}
                      >
                        <label
                          className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm"
                          style={{ paddingLeft: `${0.75 + c.depth * 1}rem` }}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => toggleCategory(c.id)}
                          />
                          <span className="text-foreground/85 truncate">
                            {c.name}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </SidebarSection>

          <SidebarSection title="Order">
            <Field
              htmlFor="sortOrder"
              label="Sort order"
              hint="Lower numbers appear first."
            >
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step="1"
                defaultValue={String(p?.sortOrder ?? 0)}
                className="h-11"
              />
            </Field>
          </SidebarSection>
        </aside>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Layout primitives (matched to category-form)
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
    <div className="border-border bg-card space-y-4 rounded-2xl border p-5">
      <h3 className="text-muted-foreground text-[11px] font-semibold tracking-[0.16em] uppercase">
        {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({
  htmlFor,
  label,
  hint,
  required,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-foreground/80 text-xs font-medium tracking-wide uppercase"
      >
        {label}
        {required && (
          <span className="text-destructive ml-0.5" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {hint && (
        <p className="text-muted-foreground/80 text-[11px] leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}

function ToggleRow({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="border-border hover:border-foreground/20 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
      <Checkbox
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5"
      />
      <span className="flex-1 leading-tight">
        <span className="text-foreground block text-sm font-medium">
          {label}
        </span>
        <span className="text-muted-foreground mt-0.5 block text-xs">
          {hint}
        </span>
      </span>
    </label>
  );
}
