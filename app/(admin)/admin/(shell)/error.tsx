"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="border-destructive/30 bg-destructive/5 rounded-md border p-4">
      <h2 className="text-destructive text-sm font-semibold">
        Something went wrong
      </h2>
      <p className="text-destructive/80 mt-1 text-sm">{error.message}</p>
      <Button variant="destructive" size="sm" className="mt-3" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}
