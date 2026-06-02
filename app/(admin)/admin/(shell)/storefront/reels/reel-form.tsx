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
import { ImageUpload } from "@/components/admin/image-upload";
import { MediaUpload } from "@/components/admin/media-upload";
import {
  createReelAction,
  updateReelAction,
  type ReelFormState,
} from "./actions";
import type { HomeReel } from "@/types";

type Props =
  | { mode: "create"; reel?: undefined }
  | { mode: "edit"; reel: HomeReel };

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
          ? "Create reel"
          : "Save changes"}
    </Button>
  );
}

export function ReelForm(props: Props) {
  const action = props.mode === "create" ? createReelAction : updateReelAction;

  const [state, formAction] = useActionState<ReelFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Saved");
  }, [state]);

  const r = props.mode === "edit" ? props.reel : null;

  return (
    <form action={formAction} className="space-y-10">
      {props.mode === "edit" && <input type="hidden" name="id" value={r!.id} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-10">
          <Section
            kicker="Content"
            title="Caption & link"
            description="All optional — they overlay the reel and add a promotion button."
          >
            <Field htmlFor="title" label="Title">
              <Input
                id="title"
                name="title"
                defaultValue={r?.title ?? ""}
                autoComplete="off"
                placeholder="Behind the stitch"
                className="h-11"
              />
            </Field>

            <Field htmlFor="caption" label="Caption">
              <Textarea
                id="caption"
                name="caption"
                defaultValue={r?.caption ?? ""}
                rows={2}
                placeholder="A short line shown under the title…"
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                htmlFor="promoHref"
                label="Promotion link"
                hint="A path like /products/slug or a full URL."
              >
                <Input
                  id="promoHref"
                  name="promoHref"
                  defaultValue={r?.promoHref ?? ""}
                  autoComplete="off"
                  placeholder="/products/classic-tote"
                  className="h-11"
                />
              </Field>

              <Field htmlFor="promoLabel" label="Button label">
                <Input
                  id="promoLabel"
                  name="promoLabel"
                  defaultValue={r?.promoLabel ?? ""}
                  autoComplete="off"
                  placeholder="Shop the look"
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
          <SidebarSection title="Video">
            <MediaUpload
              name="videoUrl"
              typeName="videoMediaType"
              defaultValue={r?.videoUrl ?? ""}
              defaultType="video"
              folder="reels"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              The reel video. Portrait (9:16) works best. MP4 or WebM.
            </p>
          </SidebarSection>

          <SidebarSection title="Poster">
            <ImageUpload
              name="posterUrl"
              defaultValue={r?.posterUrl ?? ""}
              folder="reels"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Optional still shown before the video plays. Uses the first frame
              when left empty.
            </p>
          </SidebarSection>

          <SidebarSection title="Visibility">
            <label className="group/visibility border-border hover:border-foreground/20 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
              <Checkbox
                name="published"
                defaultChecked={r?.published ?? true}
                className="mt-0.5"
              />
              <span className="flex-1 leading-tight">
                <span className="text-foreground block text-sm font-medium">
                  Published
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  When off, this reel is hidden from the storefront.
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
