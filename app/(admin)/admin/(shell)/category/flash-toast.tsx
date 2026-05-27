"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const FLASHES: Record<string, { type: "success" | "info"; message: string }> = {
  created: { type: "success", message: "Category created" },
  updated: { type: "success", message: "Category updated" },
  deleted: { type: "success", message: "Category deleted" },
};

export function FlashToast() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const firedRef = useRef<string | null>(null);

  useEffect(() => {
    let matched: string | null = null;
    for (const key of Object.keys(FLASHES)) {
      if (params.get(key) === "1") {
        matched = key;
        break;
      }
    }
    if (!matched || firedRef.current === matched) return;

    firedRef.current = matched;
    const { type, message } = FLASHES[matched];
    if (type === "success") toast.success(message);
    else toast(message);

    // Strip the flash param so a refresh doesn't re-fire.
    const next = new URLSearchParams(params.toString());
    next.delete(matched);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
