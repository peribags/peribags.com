import { searchCatalog } from "@/lib/services/storefront/search.service";

const MAX_QUERY_LENGTH = 80;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH);

  try {
    const results = await searchCatalog(q);
    return Response.json(results, {
      headers: {
        // Identical queries can be served from cache briefly.
        "cache-control": "public, max-age=30, s-maxage=60",
      },
    });
  } catch {
    // Degrade gracefully — an empty result keeps the search UI functional.
    return Response.json(
      { categories: [], products: [] },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
