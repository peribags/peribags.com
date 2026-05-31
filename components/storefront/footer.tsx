import Link from "next/link";
import { Download } from "lucide-react";
import { siteConfig } from "@/lib/site";

// Inline Instagram glyph (matches Lucide stroke style).
// The installed lucide-react version doesn't export it, so we hand-roll one.
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const SHOP_LINKS = [
  { href: "/category/totes", label: "Totes" },
  { href: "/category/slings", label: "Sling Bags" },
  { href: "/category/backpacks", label: "Backpacks" },
  { href: "/category/wallets", label: "Wallets" },
  { href: "/category", label: "All categories" },
];

const COMPANY_LINKS = [
  { href: "/about", label: "Our story" },
  { href: "/contact", label: "Contact" },
  { href: "/contact", label: "Enquiries" },
];

export function StorefrontFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 text-white/70">
      <div className="mx-auto max-w-[1600px] px-4 pt-16 pb-8 md:px-6 md:pt-20 md:pb-10 lg:px-[4vw] lg:pt-24">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
          {/* Brand block */}
          <div className="col-span-2 md:col-span-5 lg:col-span-4">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-white"
            >
              {siteConfig.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
              Premium leather bags, quietly crafted by hand. Made to carry
              well for years.
            </p>
            <a
              href={siteConfig.catalogueUrl}
              download
              className="group mt-6 inline-flex items-center gap-2 border border-white/30 px-4 py-2.5 text-xs font-medium uppercase tracking-[0.18em] text-white transition-colors hover:border-white hover:bg-white hover:text-zinc-950"
            >
              <Download className="size-3.5" />
              Catalogue
            </a>
          </div>

          {/* Shop */}
          <div className="md:col-span-3 lg:col-span-3">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
              Shop
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {SHOP_LINKS.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-2 lg:col-span-2">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
              Company
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              {COMPANY_LINKS.map((l) => (
                <li key={l.href + l.label}>
                  <Link
                    href={l.href}
                    className="text-white/70 transition-colors hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="md:col-span-2 lg:col-span-3">
            <h4 className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/40">
              Connect
            </h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href="mailto:hello@perrybags.in"
                  className="text-white/70 transition-colors hover:text-white"
                >
                  hello@perrybags.in
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-white/70 transition-colors hover:text-white"
                >
                  <InstagramIcon className="size-3.5" />
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="mt-16 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row md:items-center">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <p>Crafted in India.</p>
        </div>
      </div>
    </footer>
  );
}
