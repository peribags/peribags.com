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
import {
  createOurWorkAction,
  updateOurWorkAction,
  type OurWorkFormState,
} from "./actions";
import type { OurWorkItem } from "@/types";

type Props =
  | { mode: "create"; item?: undefined }
  | { mode: "edit"; item: OurWorkItem };

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
          ? "Create item"
          : "Save changes"}
    </Button>
  );
}

export function OurWorkForm(props: Props) {
  const action =
    props.mode === "create" ? createOurWorkAction : updateOurWorkAction;

  const [state, formAction] = useActionState<OurWorkFormState, FormData>(
    action,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Saved");
  }, [state]);

  const w = props.mode === "edit" ? props.item : null;

  return (
    <form action={formAction} className="space-y-10">
      {props.mode === "edit" && <input type="hidden" name="id" value={w!.id} />}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        {/* ───────────── Main column ───────────── */}
        <div className="space-y-10">
          <Section
            kicker="Content"
            title="Client & description"
            description="The client or brand name renders as a typographic wordmark when no logo is uploaded."
          >
            <Field htmlFor="name" label="Client / brand name">
              <Input
                id="name"
                name="name"
                defaultValue={w?.name ?? ""}
                autoComplete="off"
                placeholder="Peri Heritage"
                required
                className="h-11"
              />
            </Field>

            <Field
              htmlFor="description"
              label="Short description"
              hint="One or two lines shown below the card."
            >
              <Textarea
                id="description"
                name="description"
                defaultValue={w?.description ?? ""}
                rows={3}
                placeholder="Twelve silhouettes cut from a single batch of full-grain hides…"
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
          <SidebarSection title="Product picture">
            <ImageUpload
              name="imageUrl"
              defaultValue={w?.imageUrl ?? ""}
              folder="our-work"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              The main card image. Portrait crop reads best (4:5).
            </p>
          </SidebarSection>

          <SidebarSection title="Logo (optional)">
            <ImageUpload
              name="logoUrl"
              defaultValue={w?.logoUrl ?? ""}
              folder="our-work/logos"
            />
            <p className="text-muted-foreground mt-3 text-xs leading-relaxed">
              Small brand logo shown on the floating plate. When empty, the
              client name renders as a wordmark.
            </p>
          </SidebarSection>

          <SidebarSection title="Visibility">
            <label className="group/visibility border-border hover:border-foreground/20 flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors">
              <Checkbox
                name="published"
                defaultChecked={w?.published ?? true}
                className="mt-0.5"
              />
              <span className="flex-1 leading-tight">
                <span className="text-foreground block text-sm font-medium">
                  Published
                </span>
                <span className="text-muted-foreground mt-0.5 block text-xs">
                  When off, this item is hidden from the Our Work page.
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
