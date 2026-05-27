"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  updateEnquiryNotesAction,
  type EnquiryActionState,
} from "../actions";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={pending}>
      <Save className="size-3.5" />
      {pending ? "Saving…" : "Save notes"}
    </Button>
  );
}

export function NotesForm({
  id,
  defaultValue,
}: {
  id: string;
  defaultValue: string;
}) {
  const [state, formAction] = useActionState<EnquiryActionState, FormData>(
    updateEnquiryNotesAction,
    undefined,
  );

  useEffect(() => {
    if (state && "ok" in state && state.ok) toast.success("Notes saved");
    else if (state && "error" in state) toast.error(state.error);
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <Textarea
        name="notes"
        defaultValue={defaultValue}
        rows={4}
        placeholder="Internal notes — visible to admins only. Quotes given, when to follow up, etc."
      />
      <div className="flex justify-end">
        <SaveButton />
      </div>
    </form>
  );
}
