"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updatePasswordAction, type PasswordFormState } from "./actions";

const MIN_PASSWORD = 8;

function SaveButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending || disabled}>
      <Save className="size-4" />
      {pending ? "Updating…" : "Update password"}
    </Button>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<PasswordFormState, FormData>(
    updatePasswordAction,
    undefined,
  );

  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const tooShort = next.length > 0 && next.length < MIN_PASSWORD;
  const mismatch = confirm.length > 0 && next !== confirm;
  const disabled = next.length < MIN_PASSWORD || mismatch;

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      toast.success("Password updated");
      formRef.current?.reset();
      setNext("");
      setConfirm("");
    } else if (state && "error" in state) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <PasswordField
        id="current_password"
        name="current_password"
        label="Current password"
        autoComplete="current-password"
        show={show}
        onToggleShow={() => setShow((s) => !s)}
      />

      <PasswordField
        id="new_password"
        name="new_password"
        label="New password"
        autoComplete="new-password"
        value={next}
        onChange={(e) => setNext(e.target.value)}
        show={show}
        onToggleShow={() => setShow((s) => !s)}
        hint={
          tooShort
            ? `At least ${MIN_PASSWORD} characters required.`
            : `At least ${MIN_PASSWORD} characters.`
        }
        tone={tooShort ? "error" : "muted"}
      />

      <PasswordField
        id="confirm_password"
        name="confirm_password"
        label="Confirm new password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        show={show}
        onToggleShow={() => setShow((s) => !s)}
        hint={mismatch ? "Doesn’t match the new password." : undefined}
        tone={mismatch ? "error" : "muted"}
      />

      <div className="border-border bg-muted/30 flex items-start gap-2.5 rounded-xl border px-4 py-3 text-xs">
        <KeyRound className="text-muted-foreground mt-0.5 size-3.5 shrink-0" />
        <p className="text-muted-foreground leading-relaxed">
          You’ll stay signed in on this device. If you have other admin sessions
          active, sign them out by re-logging in there.
        </p>
      </div>

      <div className="pt-1">
        <SaveButton disabled={disabled} />
      </div>
    </form>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  value,
  onChange,
  show,
  onToggleShow,
  hint,
  tone = "muted",
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  show: boolean;
  onToggleShow: () => void;
  hint?: string;
  tone?: "muted" | "error";
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-foreground/80 text-xs font-medium tracking-wide uppercase"
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required
          minLength={MIN_PASSWORD}
          maxLength={128}
          className={cn(
            "h-11 pr-10 font-mono",
            tone === "error" && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/40",
          )}
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-muted-foreground hover:text-foreground absolute right-2 top-1/2 -translate-y-1/2 grid size-7 place-items-center rounded-md transition-colors"
        >
          {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
      </div>
      {hint && (
        <p
          className={cn(
            "text-[11px] leading-relaxed",
            tone === "error"
              ? "text-destructive"
              : "text-muted-foreground/80",
          )}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
