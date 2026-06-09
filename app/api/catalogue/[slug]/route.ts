import { buildCategoryCataloguePdf } from "@/lib/catalogue-pdf";
import { getCategoryListingData } from "@/lib/services/storefront/products.service";
import { siteConfig } from "@/lib/site";

// Needs the Node runtime for sharp + pdf-lib (not edge).
export const runtime = "nodejs";

/**
 * GET /api/catalogue/<slug>
 * Generates a downloadable PDF catalogue for a single category — its products
 * with images, names and prices — straight from the live catalogue data.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const data = await getCategoryListingData(slug);
  if (!data) {
    return new Response("Category not found", { status: 404 });
  }

  let bytes: Uint8Array;
  try {
    bytes = await buildCategoryCataloguePdf(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to build PDF";
    return new Response(message, { status: 500 });
  }

  const fileName = `${siteConfig.name}-${slug}-catalogue.pdf`;
  return new Response(new Uint8Array(bytes), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${fileName}"`,
      "cache-control": "no-store",
    },
  });
}
