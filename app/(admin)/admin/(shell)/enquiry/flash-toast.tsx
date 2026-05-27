"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

export function FlashToast() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const deleted = params.get("deleted");
    if (!deleted) return;

    toast.success("Enquiry deleted");

    const next = new URLSearchParams(params.toString());
    next.delete("deleted");
    const qs = next.toString();
    router.replace(qs ? `?${qs}` : "/admin/enquiry");
  }, [params, router]);

  return null;
}
