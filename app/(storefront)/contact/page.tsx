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
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with ${siteConfig.name} — call, email, WhatsApp, or visit us in Mumbai.`,
};

// Project-wide policy: no caching anywhere. Every request server-renders.
export const dynamic = "force-dynamic";

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
    <section className="bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Heading */}
        <div className="max-w-2xl" data-aos="fade-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            Get in touch
          </p>
          <h1 className="mt-3 text-4xl font-normal leading-[1.05] tracking-tight text-zinc-950 lg:text-5xl">
            We&apos;d love to hear from you.
          </h1>
          <p className="mt-4 text-zinc-600">
            Questions about a bag, a bulk enquiry, or just saying hello — send
            us a message or reach us directly.
          </p>
        </div>

        {/* Two columns: details | form */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:mt-16 lg:grid-cols-12 lg:gap-14">
          {/* ── Left — contact details ── */}
          <div className="lg:col-span-5" data-aos="fade-up">
            <ul className="divide-y divide-zinc-100 border-y border-zinc-100">
              <InfoRow icon={<Phone className="size-4" />} label="Call us">
                <ul className="space-y-1.5">
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
              </InfoRow>

              <InfoRow icon={<Mail className="size-4" />} label="Email us">
                <ul className="space-y-1.5">
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
              </InfoRow>

              <InfoRow
                icon={<WhatsAppIcon className="size-4" />}
                label="Chat with us"
              >
                <a
                  href={whatsappHref(
                    "Hi Peri Bags! I'd like to know more about your bags.",
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-medium text-white transition-transform hover:scale-[1.02]"
                >
                  <WhatsAppIcon className="size-4" />
                  Open WhatsApp
                </a>
              </InfoRow>

              <InfoRow icon={<MapPin className="size-4" />} label="Visit us">
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
                  className="group mt-3 inline-flex items-center gap-1.5 border-b border-zinc-900 pb-0.5 text-sm font-medium tracking-tight text-zinc-950"
                >
                  Open in Maps
                  <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </a>
              </InfoRow>
            </ul>

            {/* Socials */}
            <div className="mt-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                Follow along
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {SOCIAL_LINKS.map(({ label, href, Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="grid size-10 place-items-center rounded-full border border-zinc-200 text-zinc-600 transition-colors hover:border-zinc-900 hover:bg-zinc-950 hover:text-white"
                  >
                    <Icon className="size-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right — contact form ── */}
          <div className="lg:col-span-7" data-aos="fade-up" data-aos-delay="80">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-[0_24px_48px_-32px_rgba(15,15,15,0.18)] sm:p-8">
              <h2 className="text-xl font-medium tracking-tight text-zinc-950">
                Send us a message
              </h2>
              <p className="mt-1.5 text-sm text-zinc-600">
                Fill in the form and we&apos;ll get back to you within a
                business day.
              </p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4 py-5">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-900">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
          {label}
        </h3>
        <div className="mt-2">{children}</div>
      </div>
    </li>
  );
}
