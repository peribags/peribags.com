"use client";

export default function StorefrontError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-sm text-zinc-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white"
      >
        Try again
      </button>
    </section>
  );
}
