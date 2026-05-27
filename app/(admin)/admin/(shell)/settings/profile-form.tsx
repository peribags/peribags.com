"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Mail, Save, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileAction, type ProfileFormState } from "./actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      <Save className="size-4" />
      {pending ? "Saving…" : "Save changes"}
    </Button>
  );
}

export function ProfileForm({
  email,
  defaultDisplayName,
  defaultPhone,
}: {
  email: string;
  defaultDisplayName: string;
  defaultPhone: string;
}) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Profile updated");
    else if (state && "error" in state) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-5">
      <Field label="Email" hint="Email is your sign-in identifier and cannot be changed from here.">
        <div className="border-input bg-muted/30 flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm">
          <Mail className="text-muted-foreground size-3.5 shrink-0" />
          <span className="text-foreground/90 truncate font-medium">
            {email}
          </span>
          <span className="text-muted-foreground/80 ml-auto inline-flex shrink-0 items-center gap-1 text-[10px] font-semibold tracking-wide uppercase">
            <ShieldCheck className="size-3" />
            Locked
          </span>
        </div>
      </Field>

      <Field htmlFor="display_name" label="Display name" hint="Shown in the sidebar and on activity attribution.">
        <Input
          id="display_name"
          name="display_name"
          defaultValue={defaultDisplayName}
          maxLength={200}
          placeholder="What should we call you?"
          className="h-11"
          autoComplete="name"
        />
      </Field>

      <Field htmlFor="phone" label="Phone" hint="Optional. Used for internal records — not shown to customers.">
        <Input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={defaultPhone}
          maxLength={40}
          placeholder="+91 98765 43210"
          className="h-11"
          autoComplete="tel"
        />
      </Field>

      <div className="pt-2">
        <SaveButton />
      </div>
    </form>
  );
}

function Field({
  htmlFor,
  label,
  hint,
  children,
}: {
  htmlFor?: string;
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
