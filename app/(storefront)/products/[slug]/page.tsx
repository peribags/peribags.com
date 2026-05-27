type Params = Promise<{ slug: string }>;

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Product: {slug}</h1>
    </section>
  );
}
