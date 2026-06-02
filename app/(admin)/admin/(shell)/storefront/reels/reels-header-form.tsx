"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Save, Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateReelsHeaderAction,
  type ReelsHeaderState,
} from "./actions";
import type { HomeReelsConfig } from "@/types";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      <Save className="size-4" />
      {pending ? "Saving…" : "Save heading"}
    </Button>
  );
}

export function ReelsHeaderForm({ config }: { config: HomeReelsConfig }) {
  const [state, formAction] = useActionState<ReelsHeaderState, FormData>(
    updateReelsHeaderAction,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Heading saved");
  }, [state]);

  return (
    <section className="border-border bg-card overflow-hidden rounded-2xl border">
      <div className="border-border bg-muted/30 flex items-center gap-2 border-b px-5 py-3">
        <Type className="text-muted-foreground size-3.5" />
        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
          Section heading
        </span>
      </div>

      <form action={formAction} className="space-y-4 p-5">
        <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
          Optional copy shown above the reels on the homepage. Leave blank to
          hide the heading entirely.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="kicker"
              className="text-foreground/80 text-xs font-medium tracking-wide uppercase"
            >
              Kicker
            </Label>
            <Input
              id="kicker"
              name="kicker"
              defaultValue={config.kicker ?? ""}
              autoComplete="off"
              placeholder="From the Workshop"
              className="h-11"
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="heading"
              className="text-foreground/80 text-xs font-medium tracking-wide uppercase"
            >
              Heading
            </Label>
            <Input
              id="heading"
              name="heading"
              defaultValue={config.heading ?? ""}
              autoComplete="off"
              placeholder="In motion."
              className="h-11"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="description"
            className="text-foreground/80 text-xs font-medium tracking-wide uppercase"
          >
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={config.description ?? ""}
            rows={2}
            placeholder="Short films and behind-the-scenes glimpses from our workshop."
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
