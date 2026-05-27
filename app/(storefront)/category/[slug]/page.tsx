export const metadata = { title: "Category" };

export default async function CategoryPage({
  params,
}: PageProps<"/category/[slug]">) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
        Collection
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-900">
        {slug}
      </h1>
      <p className="mt-4 text-zinc-600">
        Category page coming soon.
      </p>
    </section>
  );
}
