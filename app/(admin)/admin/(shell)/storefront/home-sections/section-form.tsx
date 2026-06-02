"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, FolderTree, Package, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OrderedPicker, type PickerOption } from "@/components/admin/ordered-picker";
import { cn } from "@/lib/utils";
import {
  createSectionAction,
  updateSectionAction,
  type SectionFormState,
} from "./actions";
import type {
  HomeSection,
  HomeSectionProductSource,
  HomeSectionType,
} from "@/types";

type Props =
  | {
      mode: "create";
      section?: undefined;
      categoryOptions: PickerOption[];
      productOptions: PickerOption[];
    }
  | {
      mode: "edit";
      section: HomeSection;
      categoryOptions: PickerOption[];
      productOptions: PickerOption[];
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
          ? "Create section"
          : "Save changes"}
    </Button>
  );
}

export function SectionForm(props: Props) {
  const action =
    props.mode === "create" ? createSectionAction : updateSectionAction;

  const [state, formAction] = useActionState<SectionFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Saved");
  }, [state]);

  const s = props.mode === "edit" ? props.section : null;

  const [type, setType] = useState<HomeSectionType>(s?.type ?? "category");
  const [source, setSource] = useState<HomeSectionProductSource>(
    s?.productSource ?? "categories",
  );

  const showCategoryPicker =
    type === "category" || (type === "product" && source === "categories");
  const showProductPicker = type === "product" && source === "manual";

  return (
    <form action={formAction} className="space-y-10">
      {props.mode === "edit" && <input type="hidden" name="id" value={s!.id} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-10">
          <Section
            kicker="Type"
            title="Section type"
            description="Category sections show category tiles. Product sections show a product grid."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <TypeCard
                active={type === "category"}
                icon={<FolderTree className="size-4" />}
                title="Category"
                description="A row of category tiles."
                onClick={() => setType("category")}
              />
              <TypeCard
                active={type === "product"}
                icon={<Package className="size-4" />}
                title="Product"
                description="A grid of products."
                onClick={() => setType("product")}
              />
            </div>
            <input type="hidden" name="type" value={type} />
          </Section>

          <Section
            kicker="Content"
            title="Heading & copy"
            description="All optional — leave blank to hide. The heading block won't render if everything is empty."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field htmlFor="kicker" label="Kicker" hint="Small label above the heading.">
                <Input
                  id="kicker"
                  name="kicker"
                  defaultValue={s?.kicker ?? ""}
                  autoComplete="off"
                  placeholder={type === "category" ? "Shop by Category" : "Just In"}
                  className="h-11"
                />
              </Field>
              <Field htmlFor="heading" label="Heading">
                <Input
                  id="heading"
                  name="heading"
                  defaultValue={s?.heading ?? ""}
                  autoComplete="off"
                  placeholder={
                    type === "category"
                      ? "Find your everyday companion."
                      : "New Arrivals"
                  }
                  className="h-11"
                />
              </Field>
            </div>
            <Field htmlFor="description" label="Description">
              <Textarea
                id="description"
                name="description"
                defaultValue={s?.description ?? ""}
                rows={2}
                placeholder="An optional sentence under the heading…"
              />
            </Field>
          </Section>

          {/* Source toggle (product sections only) */}
          {type === "product" && (
            <Section
              kicker="Products"
              title="Where do products come from?"
              description="Pull every product from selected categories, or hand-pick individual products."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <TypeCard
                  active={source === "categories"}
                  icon={<FolderTree className="size-4" />}
                  title="From categories"
                  description="Show products in the chosen categories."
                  onClick={() => setSource("categories")}
                />
                <TypeCard
                  active={source === "manual"}
                  icon={<Package className="size-4" />}
                  title="Hand-picked"
                  description="Pick exact products to feature."
                  onClick={() => setSource("manual")}
                />
              </div>
              <input type="hidden" name="productSource" value={source} />
            </Section>
          )}

          {/* Category picker — kept mounted (hidden) so selections persist on toggle. */}
          <Section
            kicker="Selection"
            title={type === "category" ? "Categories to show" : "Source categories"}
            description={
              type === "category"
                ? "Pick the categories to display as tiles, in order. Drag to reorder."
                : "Pick the categories whose products will be shown. Drag to reorder."
            }
            className={cn(!showCategoryPicker && "hidden")}
          >
            <OrderedPicker
              name="categoryIds"
              options={props.categoryOptions}
              defaultValue={s?.categoryIds ?? []}
              searchPlaceholder="Search categories…"
              emptyHint="No categories selected yet."
            />
          </Section>

          {/* Product picker */}
          <Section
            kicker="Selection"
            title="Products to feature"
            description="Pick the exact products to show, in order. Drag to reorder."
            className={cn(!showProductPicker && "hidden")}
          >
            <OrderedPicker
              name="productIds"
              options={props.productOptions}
              defaultValue={s?.productIds ?? []}
              searchPlaceholder="Search products…"
              emptyHint="No products selected yet."
              thumbs
            />
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
          <SidebarSection title="Display">
            <Field
              htmlFor="itemLimit"
              label="Item limit"
              hint="Max tiles / products to show. Blank = show all selected."
            >
              <Input
                id="itemLimit"
                name="itemLimit"
                type="number"
                min="1"
                step="1"
                defaultValue={s?.itemLimit != null ? String(s.itemLimit) : ""}
                placeholder="e.g. 10"
                className="h-11"
              />
            </Field>

            {type === "product" && (
              <Field
                htmlFor="background"
                label="Background"
                hint="Optional CSS colour for the band, e.g. #FAF7F1."
              >
                <Input
                  id="background"
                  name="background"
                  defaultValue={s?.background ?? ""}
                  autoComplete="off"
                  placeholder="#ffffff"
                  className="h-11"
                />
              </Field>
            )}
          </SidebarSection>

          <SidebarSection title="View all link">
            <Field htmlFor="viewAllHref" label="Link" hint="Optional CTA below the section.">
              <Input
                id="viewAllHref"
                name="viewAllHref"
                defaultValue={s?.viewAllHref ?? ""}
                autoComplete="off"
                placeholder="/category"
                className="h-11"
              />
            </Field>
            <Field htmlFor="viewAllLabel" label="Label">
              <Input
                id="viewAllLabel"
                name="viewAllLabel"
                defaultValue={s?.viewAllLabel ?? ""}
                autoComplete="off"
                placeholder="View all"
                className="h-11"
              />
            </Field>
          </SidebarSection>

          <SidebarSection title="Visibility">
            <label className="group/visibility border-border hover:border-foreground/20 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
              <Checkbox
                name="published"
                defaultChecked={s?.published ?? true}
                className="mt-0.5"
              />
              <span className="flex-1 leading-tight">
                <span className="text-foreground block text-sm font-medium">
                  Published
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  When off, this section is hidden from the homepage.
                </span>
              </span>
            </label>
          </SidebarSection>
        </aside>
      </div>
    </form>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Layout primitives
// ────────────────────────────────────────────────────────────────────────────

function TypeCard({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4 text-left transition-colors",
        active
          ? "border-foreground bg-accent/50"
          : "border-border hover:border-foreground/30 hover:bg-accent/30",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          active
            ? "bg-foreground text-background"
            : "bg-muted text-muted-foreground",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="text-foreground block text-sm font-semibold">
          {title}
        </span>
        <span className="text-muted-foreground mt-0.5 block text-xs leading-snug">
          {description}
        </span>
      </span>
    </button>
  );
}

function Section({
  kicker,
  title,
  description,
  className,
  children,
}: {
  kicker?: string;
  title: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-5", className)}>
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
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-foreground/80 text-xs font-medium tracking-wide uppercase"
      >
        {label}
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
