// Single source of truth for company/contact details — used across the
// storefront (footer, contact page, header, product pages, metadata, sitemap).

const PHONES = ["9224588670", "9870135135", "7977010646"] as const;
const EMAILS = ["peribags01@gmail.com", "peribags26@gmail.com"] as const;

// The number used for WhatsApp + the primary call-to-action (digits only, with
// country code, for wa.me / tel links).
const WHATSAPP_NUMBER = "919224588670";

export const siteConfig = {
  name: "peribags",
  description: "Premium bags, crafted to last.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  // Public PDF catalogue. Drop the file at public/catalogue.pdf and it works.
  catalogueUrl: "/catalogue.pdf",

  emails: EMAILS,
  /** Primary email (first of EMAILS). */
  email: EMAILS[0],

  phones: PHONES,
  /** Primary phone (first of PHONES). */
  phone: PHONES[0],

  whatsappNumber: WHATSAPP_NUMBER,

  address: {
    line1: "64, Halim Manzil, Morland Rd",
    line2: "near Bank of Baroda, Mumbai Central",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400008",
    country: "India",
    full: "64, Halim Manzil, Morland Rd, near Bank of Baroda, Mumbai Central, Mumbai, Maharashtra 400008",
    mapUrl: "https://share.google/PYu5cFTKsH8VZ68Ca",
  },

  links: {
    instagram: "https://www.instagram.com/peribags08/",
    facebook: "https://www.facebook.com/profile.php",
    youtube: "https://www.youtube.com/@peribags08",
    linkedin: "https://www.linkedin.com/company/peri-bags/",
    whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
  },

  /**
   * Static maintenance flag for the storefront. Flip `enabled` and redeploy
   * to take the public site offline; the admin panel is unaffected because it
   * lives in a separate route group with its own layout.
   */
  maintenance: {
    enabled: false,
    // enabled: process.env.NODE_ENV === "production" ? true : false,
    heading: "We're sprucing the place up.",
    body: "peribags will be back online shortly. For urgent enquiries, reach out via email, phone, or WhatsApp.",
    eta: "Back online soon",
  },
} as const;

export type SiteConfig = typeof siteConfig;

/** `tel:` href for a raw 10-digit Indian number. */
export function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `tel:+91${digits}`;
}

/** Display form, e.g. "+91 92245 88670". */
export function formatPhone(phone: string): string {
  const d = phone.replace(/\D/g, "");
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  return `+91 ${d}`;
}

/** `mailto:` href. */
export function mailHref(email: string): string {
  return `mailto:${email}`;
}

/** Pre-filled WhatsApp chat link. */
export function whatsappHref(message?: string): string {
  const base = `https://wa.me/${siteConfig.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
