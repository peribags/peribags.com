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
import { ImageUpload } from "@/components/admin/image-upload";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/utils";
import {
  createCategoryAction,
  updateCategoryAction,
  type CategoryFormState,
} from "./actions";
import type { Category } from "@/types";

type ParentOption = { id: string; label: string };

type Props =
  | {
      mode: "create";
      category?: undefined;
      parentOptions: ParentOption[];
      defaultParentId?: string | null;
    }
  | {
      mode: "edit";
      category: Category;
      parentOptions: ParentOption[];
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
          ? "Create category"
          : "Save changes"}
    </Button>
  );
}

export function CategoryForm(props: Props) {
  const action =
    props.mode === "create" ? createCategoryAction : updateCategoryAction;

  const [state, formAction] = useActionState<CategoryFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Saved");
  }, [state]);

  const c = props.mode === "edit" ? props.category : null;
  const defaultParent =
    props.mode === "edit"
      ? (c?.parentId ?? "")
      : (props.defaultParentId ?? "");

  const [name, setName] = useState(c?.name ?? "");
  const [slug, setSlug] = useState(c?.slug ?? "");
  const slugTouched = useRef<boolean>(!!c?.slug);

  useEffect(() => {
    if (!slugTouched.current) setSlug(slugify(name));
  }, [name]);

  const [metaTitle, setMetaTitle] = useState(c?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    c?.metaDescription ?? "",
  );

  return (
    <form action={formAction} className="space-y-10">
      {props.mode === "edit" && (
        <input type="hidden" name="id" value={c!.id} />
      )}

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
                  placeholder="Leather Totes"
                  className="h-11"
                />
              </Field>

              <Field
                htmlFor="slug"
                label="Slug"
                hint="Lowercase, hyphens. Auto-numbered if a sibling collides."
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
              htmlFor="description"
              label="Description"
              hint="Optional. Appears on the storefront category page."
            >
              <Textarea
                id="description"
                name="description"
                defaultValue={c?.description ?? ""}
                rows={5}
                placeholder="A few sentences about what belongs in this category…"
              />
            </Field>
          </Section>

          <Section
            kicker="SEO"
            title="Search & social"
            description="How this category appears in Google results and link previews. Both fields are optional — name and description are used as fallbacks."
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
                placeholder={c?.name ? `${c.name} · PERI` : "Leather Totes · PERI"}
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
                placeholder="Shop our handcrafted leather totes — full-grain leather, made in India…"
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
          <SidebarSection title="Image">
            <ImageUpload
              name="imageUrl"
              defaultValue={c?.imageUrl ?? ""}
              folder="categories"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Square works best. JPG, PNG, WebP, AVIF or GIF up to 8 MB.
            </p>
          </SidebarSection>

          <SidebarSection title="Hierarchy">
            <Field
              htmlFor="parentId"
              label="Parent"
              hint="A category cannot be moved under one of its own descendants."
            >
              <select
                id="parentId"
                name="parentId"
                defaultValue={defaultParent}
                className="border-input bg-background hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-11 w-full rounded-lg border px-3 text-sm outline-none transition-colors"
              >
                <option value="">— Top level —</option>
                {props.parentOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              htmlFor="sortOrder"
              label="Sort order"
              hint="Lower numbers appear first among siblings."
            >
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step="1"
                defaultValue={String(c?.sortOrder ?? 0)}
                className="h-11"
              />
            </Field>
          </SidebarSection>

          <SidebarSection title="Visibility">
            <label className="group/visibility border-border hover:border-foreground/20 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
              <Checkbox
                name="published"
                defaultChecked={c?.published ?? true}
                className="mt-0.5"
              />
              <span className="flex-1 leading-tight">
                <span className="text-foreground block text-sm font-medium">
                  Published
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  When off, this category is hidden from the storefront but
                  still visible here in admin.
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
          <span className={cn("text-destructive ml-0.5")} aria-hidden>
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
