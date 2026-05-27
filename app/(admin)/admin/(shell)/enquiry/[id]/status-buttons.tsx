"use client";

import { useTransition } from "react";
import { Archive, CheckCircle2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { EnquiryStatus } from "@/types";
import { updateEnquiryStatusAction } from "../actions";

const OPTIONS: {
  value: EnquiryStatus;
  label: string;
  icon: typeof Inbox;
}[] = [
  { value: "new", label: "New", icon: Inbox },
  { value: "responded", label: "Responded", icon: CheckCircle2 },
  { value: "archived", label: "Archived", icon: Archive },
];

export function StatusButtons({
  id,
  current,
}: {
  id: string;
  current: EnquiryStatus;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(value: EnquiryStatus) {
    if (value === current || pending) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("status", value);
    startTransition(async () => {
      await updateEnquiryStatusAction(fd);
      toast.success(`Marked as ${value}`);
    });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Enquiry status"
      className="border-border bg-card inline-flex items-center gap-1 rounded-xl border p-1"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = current === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={pending}
            onClick={() => setStatus(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
              "disabled:cursor-wait disabled:opacity-60",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
