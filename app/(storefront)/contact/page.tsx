import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import {
  siteConfig,
  telHref,
  formatPhone,
  mailHref,
  whatsappHref,
} from "@/lib/site";
import {
  SOCIAL_LINKS,
  WhatsAppIcon,
} from "@/components/storefront/social-links";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} — call, email, WhatsApp, or visit us in Mumbai.`,
};

// Organization structured data for SEO / rich results.
function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: siteConfig.name,
    url: siteConfig.url,
    email: siteConfig.email,
    telephone: siteConfig.phones.map((p) => `+91${p.replace(/\D/g, "")}`),
    address: {
      "@type": "PostalAddress",
      streetAddress: `${siteConfig.address.line1}, ${siteConfig.address.line2}`,
      addressLocality: siteConfig.address.city,
      addressRegion: siteConfig.address.state,
      postalCode: siteConfig.address.postalCode,
      addressCountry: "IN",
    },
    sameAs: [
      siteConfig.links.instagram,
      siteConfig.links.facebook,
      siteConfig.links.youtube,
      siteConfig.links.linkedin,
    ],
  };
}

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }}
      />

      {/* Heading */}
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Get in touch
        </p>
        <h1 className="mt-3 text-4xl font-normal tracking-tight text-zinc-950 lg:text-5xl">
          We&apos;d love to hear from you.
        </h1>
        <p className="mt-4 text-zinc-600">
          Questions about a bag, a bulk enquiry, or just saying hello — reach us
          however suits you best.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-16 lg:gap-6">
        {/* Call */}
        <InfoCard icon={<Phone className="size-5" />} title="Call us">
          <ul className="space-y-2">
            {siteConfig.phones.map((p) => (
              <li key={p}>
                <a
                  href={telHref(p)}
                  className="text-sm tabular-nums text-zinc-700 transition-colors hover:text-zinc-950"
                >
                  {formatPhone(p)}
                </a>
              </li>
            ))}
          </ul>
        </InfoCard>

        {/* Email */}
        <InfoCard icon={<Mail className="size-5" />} title="Email us">
          <ul className="space-y-2">
            {siteConfig.emails.map((e) => (
              <li key={e}>
                <a
                  href={mailHref(e)}
                  className="text-sm text-zinc-700 transition-colors hover:text-zinc-950"
                >
                  {e}
                </a>
              </li>
            ))}
          </ul>
        </InfoCard>

        {/* WhatsApp */}
        <InfoCard
          icon={<WhatsAppIcon className="size-5" />}
          title="Chat with us"
        >
          <p className="text-sm text-zinc-600">
            Message us on WhatsApp for a quick reply.
          </p>
          <a
            href={whatsappHref(
              "Hi Peri Bags! I'd like to know more about your bags.",
            )}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2.5 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
          >
            <WhatsAppIcon className="size-4" />
            Open WhatsApp
          </a>
        </InfoCard>

        {/* Visit */}
        <InfoCard icon={<MapPin className="size-5" />} title="Visit us">
          <address className="text-sm not-italic leading-relaxed text-zinc-700">
            {siteConfig.address.line1},<br />
            {siteConfig.address.line2},<br />
            {siteConfig.address.city}, {siteConfig.address.state}{" "}
            {siteConfig.address.postalCode}
          </address>
          <a
            href={siteConfig.address.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="group mt-4 inline-flex items-center gap-1.5 border-b border-zinc-900 pb-0.5 text-sm font-medium tracking-tight text-zinc-950"
          >
            Open in Maps
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </InfoCard>
      </div>

      {/* Socials */}
      <div className="mt-12 border-t border-zinc-200 pt-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          Follow along
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {SOCIAL_LINKS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2.5 text-sm text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-950"
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-full bg-zinc-100 text-zinc-900">
          {icon}
        </span>
        <h2 className="text-sm font-medium uppercase tracking-[0.16em] text-zinc-500">
          {title}
        </h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
