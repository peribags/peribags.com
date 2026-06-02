import Categories from "./Categories";
import ProductShowcase from "./ProductShowcase";
import {
  getPublishedHomeSections,
  type ResolvedHomeSection,
} from "@/lib/services/storefront/home-sections.service";

/**
 * Dynamic homepage sections, configured in the admin panel. When none are
 * configured (or they can't be loaded), the original default layout renders
 * so the homepage is never empty.
 */
export default async function HomeSections() {
  let sections: ResolvedHomeSection[];
  try {
    sections = await getPublishedHomeSections();
  } catch {
    sections = [];
  }

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((s) =>
        s.type === "category" ? (
          <Categories
            key={s.id}
            kicker={s.kicker}
            heading={s.heading}
            description={s.description}
            tiles={s.tiles}
            viewAllHref={s.viewAllHref ?? null}
            viewAllLabel={s.viewAllLabel}
          />
        ) : (
          <ProductShowcase
            key={s.id}
            kicker={s.kicker}
            heading={s.heading}
            description={s.description}
            background={s.background}
            products={s.products}
            limit={s.limit}
            viewAllHref={s.viewAllHref}
            viewAllLabel={s.viewAllLabel}
          />
        ),
      )}
    </>
  );
}

