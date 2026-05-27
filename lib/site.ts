export const siteConfig = {
  name: "Perry Bags",
  description: "Premium bags, crafted to last.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Public PDF catalogue. Drop the file at public/catalogue.pdf and it works.
  // Swap to an R2 URL or a settings-backed value later if needed.
  catalogueUrl: "/catalogue.pdf",
  links: {
    twitter: "",
    instagram: "",
  },
} as const;

export type SiteConfig = typeof siteConfig;
