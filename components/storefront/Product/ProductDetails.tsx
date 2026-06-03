import type { ProductDetail } from "@/lib/services/storefront/product-detail.service";
import { cn } from "@/lib/utils";

type Props = {
  product: ProductDetail;
};

export default function ProductDetails({ product }: Props) {
  if (!product.description) return null;

  return (
    <section className="border-t border-zinc-200 pt-8">
      <h2 className="text-base font-medium tracking-tight text-zinc-950 sm:text-lg">
        Description
      </h2>
      <div
        className={cn(
          "perry-prose mt-5 text-[13px] font-light leading-relaxed text-zinc-700 sm:text-base",
          // Block spacing
          "[&>p]:mb-4 [&>p:last-child]:mb-0",
          "[&>ul]:my-4 [&>ol]:my-4",
          "[&>blockquote]:my-4",
          // Headings inside the body copy
          "[&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-medium [&_h1]:tracking-tight [&_h1]:text-zinc-950",
          "[&_h2]:mb-3 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-zinc-950",
          "[&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-medium [&_h3]:tracking-tight [&_h3]:text-zinc-950",
          // Lists
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
          "[&_li]:mb-1.5 [&_li:last-child]:mb-0",
          "[&_li>p]:mb-0",
          // Inline
          "[&_strong]:font-medium [&_strong]:text-zinc-950",
          "[&_b]:font-medium [&_b]:text-zinc-950",
          // Brand voice: no italic (overrides <em>/<i>)
          "[&_em]:not-italic [&_i]:not-italic",
          // Links
          "[&_a]:text-zinc-950 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-zinc-600",
          // Blockquote
          "[&_blockquote]:border-l-2 [&_blockquote]:border-zinc-300 [&_blockquote]:pl-4 [&_blockquote]:text-zinc-600",
          // Inline code
          "[&_code]:rounded [&_code]:bg-zinc-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.875em]",
          // Horizontal rule
          "[&_hr]:my-6 [&_hr]:border-zinc-200",
          // Images embedded by the editor — keep them responsive
          "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full",
        )}
        // Description is authored in the admin panel by an authenticated admin
        // (RLS prevents non-admin writes). Rendering as HTML is intentional.
        dangerouslySetInnerHTML={{ __html: product.description }}
      />
    </section>
  );
}
