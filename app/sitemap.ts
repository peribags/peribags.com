import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";
import { createAnonClient } from "@/lib/supabase/anon";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/category`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.5 },
  ];

  try {
    const supabase = createAnonClient();
    const [cats, prods] = await Promise.all([
      supabase.from("categories").select("slug, updated_at").eq("published", true),
      supabase.from("products").select("slug, updated_at").eq("published", true),
    ]);

    const categoryUrls: MetadataRoute.Sitemap = (cats.data ?? []).map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: c.updated_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    const productUrls: MetadataRoute.Sitemap = (prods.data ?? []).map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updated_at ?? undefined,
      changeFrequency: "weekly",
      priority: 0.6,
    }));

    return [...staticRoutes, ...categoryUrls, ...productUrls];
  } catch {
    // DB unavailable — still return the static routes.
    return staticRoutes;
  }
}
