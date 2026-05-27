"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const FLASHES: Record<string, { type: "success" | "info"; message: string }> = {
  created: { type: "success", message: "Product created" },
  updated: { type: "success", message: "Product updated" },
  deleted: { type: "success", message: "Product deleted" },
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

    const next = new URLSearchParams(params.toString());
    next.delete(matched);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [params, pathname, router]);

  return null;
}
