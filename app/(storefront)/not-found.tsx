import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-zinc-600">
        The page you were looking for doesn&rsquo;t exist.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-white"
      >
        Back home
      </Link>
    </section>
  );
}
