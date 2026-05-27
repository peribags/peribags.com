import Link from "next/link";

export function ProductCard({
  product,
}: {
  product: { slug: string; name: string; price: number };
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group block overflow-hidden rounded-lg border border-zinc-200 bg-white"
    >
      <div className="aspect-square bg-zinc-100" />
      <div className="p-4">
        <div className="text-sm font-medium text-zinc-900">{product.name}</div>
        <div className="mt-1 text-sm text-zinc-600">
          ${product.price.toFixed(2)}
        </div>
      </div>
    </Link>
  );
}
