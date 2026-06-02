import type { Route } from "next";
import type { HeroBannerSlide } from "@/components/storefront/Home/Hero";

export type HeroSlide = {
  id: string;
  /** Path to image. Leave empty to render only the gradient backdrop. */
  imageUrl?: string;
  /** Alt text for the image — also helps SEO. */
  alt: string;
  /** Optional small label above the heading. */
  kicker?: string;
  heading: string;
  description?: string;
  cta?: { label: string; href: Route };
  /** Tailwind classes for the gradient backdrop (rendered behind/around the image). */
  gradient?: string;
};

// Drop replacement images at the referenced paths in /public to fill in slides.
// Until then, slides without an image fall back to their gradient backdrop.
export const heroSlides: HeroSlide[] = [
  {
    id: "craft",
    imageUrl: "/hero.webp",
    alt: "Handcrafted leather bag from the new Perry collection.",
    kicker: "New Collection",
    heading: "Crafted to outlast trends.",
    description:
      "Full-grain leather, hand-stitched in India. Built for a lifetime, not a season.",
    cta: { label: "Shop the collection", href: "/products" },
    gradient: "bg-gradient-to-br from-stone-700 to-stone-950",
  },
  {
    id: "everyday",
    imageUrl: "/hero1.webp",
    alt: "Perry leather tote in everyday use.",
    kicker: "Everyday Essentials",
    heading: "One bag. Every day.",
    description:
      "Totes and slings designed to carry the whole of your day — and look like they were made to.",
    cta: { label: "Explore totes", href: "/products" },
    gradient: "bg-gradient-to-br from-amber-900 to-zinc-950",
  },
];

/**
 * Static fallback for the storefront Hero, used when no banner slides have
 * been configured in the admin panel (or the banner can't be loaded).
 */
export const fallbackHeroBannerSlides: HeroBannerSlide[] = heroSlides.map(
  (s) => ({
    id: s.id,
    desktopMedia: s.imageUrl
      ? { type: "image", url: s.imageUrl }
      : undefined,
    alt: s.alt,
    kicker: s.kicker,
    heading: s.heading,
    description: s.description,
    cta: s.cta ? { label: s.cta.label, href: s.cta.href } : undefined,
    gradient: s.gradient,
  }),
);
