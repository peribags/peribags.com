// Read colour swatches off the real product variant system (products.options
// jsonb defined in migration 0011_product_variants.sql), NOT from any spec
// text. A product shows swatches only when it has a "Color" / "Colour" option
// group with at least one value.

export type ColorSwatch = {
  name: string;
  /** Resolved R2 URL when the admin uploaded a swatch image, otherwise null. */
  imageUrl: string | null;
};

export type ColorVariants = {
  swatches: ColorSwatch[];
  totalCount: number;
};

export const MAX_VISIBLE_SWATCHES = 4;

/**
 * Extract the Color option group from a product's `options` jsonb column and
 * return up to MAX_VISIBLE swatches + the total count. Returns null when no
 * Color group exists or it has no values — caller renders nothing in that case.
 *
 * @param raw           the raw `products.options` jsonb value
 * @param resolveImage  resolver from R2 key → public URL (server-only helper)
 */
export function extractColorVariants(
  raw: unknown,
  resolveImage: (key: string) => string,
): ColorVariants | null {
  if (!Array.isArray(raw)) return null;

  for (const group of raw) {
    if (!group || typeof group !== "object") continue;
    const g = group as Record<string, unknown>;
    const name = typeof g.name === "string" ? g.name.trim().toLowerCase() : "";
    if (name !== "color" && name !== "colour") continue;

    const values = Array.isArray(g.values) ? g.values : [];
    const all: ColorSwatch[] = [];
    for (const v of values) {
      if (!v || typeof v !== "object") continue;
      const vo = v as Record<string, unknown>;
      const valueName = typeof vo.name === "string" ? vo.name.trim() : "";
      if (!valueName) continue;
      const swatchKey =
        typeof vo.swatch_image === "string" && vo.swatch_image.trim() !== ""
          ? vo.swatch_image.trim()
          : null;
      all.push({
        name: valueName,
        imageUrl: swatchKey ? resolveImage(swatchKey) : null,
      });
    }

    if (all.length === 0) return null;
    return {
      swatches: all.slice(0, MAX_VISIBLE_SWATCHES),
      totalCount: all.length,
    };
  }

  return null;
}
