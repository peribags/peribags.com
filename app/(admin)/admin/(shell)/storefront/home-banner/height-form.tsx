"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Monitor, Ruler, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  updateBannerHeightAction,
  type HeightFormState,
} from "./actions";

const UNITS = ["vh", "svh", "px", "rem"] as const;

/** Split a stored CSS value like "640px" into { value: "640", unit: "px" }. */
function parseHeight(height: string | null): { value: string; unit: string } {
  if (!height) return { value: "", unit: "vh" };
  const m = height.trim().match(/^(\d+(?:\.\d+)?)\s*(vh|svh|px|rem)$/i);
  if (!m) return { value: "", unit: "vh" };
  return { value: m[1], unit: m[2].toLowerCase() };
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="size-4" />
      {pending ? "Saving…" : "Save height"}
    </Button>
  );
}

export function HeightForm({
  heightDesktop,
  heightMobile,
}: {
  heightDesktop: string | null;
  heightMobile: string | null;
}) {
  const [state, formAction] = useActionState<HeightFormState, FormData>(
    updateBannerHeightAction,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Banner height saved");
  }, [state]);

  const desktop = parseHeight(heightDesktop);
  const mobile = parseHeight(heightMobile);

  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border bg-muted/30 flex items-center gap-2 border-b px-5 py-3">
        <Ruler className="text-muted-foreground size-3.5" />
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Banner height
        </span>
      </div>

      <form action={formAction} className="space-y-5 p-5">
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          The height the banner takes on the storefront. Set desktop and mobile
          separately. Leave a field blank to use the responsive default;
          mobile falls back to the desktop value when blank.{" "}
          <span className="text-foreground/80">vh</span> = % of screen height,{" "}
          <span className="text-foreground/80">px</span> = fixed pixels.
        </p>

        <div className="grid gap-5 sm:grid-cols-2">
          <HeightRow
            icon={<Monitor className="size-3.5" />}
            label="Desktop"
            name="heightDesktop"
            defaultValue={desktop.value}
            defaultUnit={desktop.unit}
          />
          <HeightRow
            icon={<Smartphone className="size-3.5" />}
            label="Mobile"
            name="heightMobile"
            defaultValue={mobile.value}
            defaultUnit={mobile.unit}
          />
        </div>

        <div className="flex items-center gap-3">
          <SubmitButton />
          {state && "error" in state && (
            <p className="text-destructive text-xs">{state.error}</p>
          )}
        </div>
      </form>
    </section>
  );
}

function HeightRow({
  icon,
  label,
  name,
  defaultValue,
  defaultUnit,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  defaultValue: string;
  defaultUnit: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-foreground/80 flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase">
        {icon}
        {label}
      </Label>
      <div className="flex items-end gap-2">
        <Input
          name={`${name}Value`}
          type="number"
          min="0"
          step="1"
          defaultValue={defaultValue}
          placeholder="80"
          className="h-11 w-28"
          aria-label={`${label} height value`}
        />
        <select
          name={`${name}Unit`}
          defaultValue={defaultUnit}
          aria-label={`${label} height unit`}
          className="border-input bg-background hover:border-foreground/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 h-11 w-24 rounded-lg border px-3 text-sm outline-none transition-colors"
        >
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
