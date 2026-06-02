"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/admin/media-upload";
import {
  createBannerSlideAction,
  updateBannerSlideAction,
  type BannerFormState,
} from "./actions";
import type { HomeBannerSlide } from "@/types";

type Props =
  | { mode: "create"; slide?: undefined }
  | { mode: "edit"; slide: HomeBannerSlide };

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
          ? "Create slide"
          : "Save changes"}
    </Button>
  );
}

export function BannerSlideForm(props: Props) {
  const action =
    props.mode === "create" ? createBannerSlideAction : updateBannerSlideAction;

  const [state, formAction] = useActionState<BannerFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Saved");
  }, [state]);

  const s = props.mode === "edit" ? props.slide : null;

  return (
    <form action={formAction} className="space-y-10">
      {props.mode === "edit" && <input type="hidden" name="id" value={s!.id} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-10">
          <Section
            kicker="Content"
            title="Overlay text"
            description="Optional copy shown over the slide. Leave any field blank to hide it."
          >
            <Field htmlFor="kicker" label="Kicker" hint="Small label above the heading.">
              <Input
                id="kicker"
                name="kicker"
                defaultValue={s?.kicker ?? ""}
                autoComplete="off"
                placeholder="New Collection"
                className="h-11"
              />
            </Field>

            <Field htmlFor="heading" label="Heading">
              <Input
                id="heading"
                name="heading"
                defaultValue={s?.heading ?? ""}
                autoComplete="off"
                placeholder="Crafted to outlast trends."
                className="h-11"
              />
            </Field>

            <Field htmlFor="description" label="Description">
              <Textarea
                id="description"
                name="description"
                defaultValue={s?.description ?? ""}
                rows={3}
                placeholder="A sentence or two that sits under the heading…"
              />
            </Field>
          </Section>

          <Section
            kicker="Link"
            title="Call to action"
            description="An optional button. Both fields are needed for the button to appear."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field htmlFor="ctaLabel" label="Button label">
                <Input
                  id="ctaLabel"
                  name="ctaLabel"
                  defaultValue={s?.ctaLabel ?? ""}
                  autoComplete="off"
                  placeholder="Shop the collection"
                  className="h-11"
                />
              </Field>

              <Field
                htmlFor="ctaHref"
                label="Button link"
                hint="A path like /products or a full URL."
              >
                <Input
                  id="ctaHref"
                  name="ctaHref"
                  defaultValue={s?.ctaHref ?? ""}
                  autoComplete="off"
                  placeholder="/products"
                  className="h-11"
                />
              </Field>
            </div>
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
          <SidebarSection title="Desktop media">
            <MediaUpload
              name="mediaUrl"
              typeName="mediaType"
              defaultValue={s?.mediaUrl ?? ""}
              defaultType={s?.mediaType ?? "image"}
              folder="home-banner"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Image or video shown on desktop (and everywhere if no mobile media
              is set). Landscape (16:9) works best.
            </p>
            <div className="mt-4">
              <Field
                htmlFor="alt"
                label="Alt text"
                hint="Describes the media for screen readers and SEO."
              >
                <Input
                  id="alt"
                  name="alt"
                  defaultValue={s?.alt ?? ""}
                  autoComplete="off"
                  placeholder="Handcrafted leather bag"
                  className="h-11"
                />
              </Field>
            </div>
          </SidebarSection>

          <SidebarSection title="Mobile media">
            <MediaUpload
              name="mobileMediaUrl"
              typeName="mobileMediaType"
              defaultValue={s?.mobileMediaUrl ?? ""}
              defaultType={s?.mobileMediaType ?? "image"}
              folder="home-banner"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Optional. A portrait-friendly image or video for small screens.
              Leave empty to reuse the desktop media.
            </p>
          </SidebarSection>

          <SidebarSection title="Ordering">
            <Field
              htmlFor="sortOrder"
              label="Sort order"
              hint="Lower numbers appear first in the carousel."
            >
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                step="1"
                defaultValue={String(s?.sortOrder ?? 0)}
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
                  When off, this slide is hidden from the storefront banner.
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
// Layout primitives (mirrors the category / product forms)
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
