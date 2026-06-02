import {
  formatPhone,
  mailHref,
  siteConfig,
  telHref,
  whatsappHref,
} from "@/lib/site";

/**
 * Full-bleed maintenance / coming-soon screen. Rendered by the storefront
 * layout when `siteConfig.maintenance.enabled` is true. Replaces header,
 * footer, and all page content with a single editorial holding page.
 */
export function MaintenanceScreen() {
  const { heading, body, eta } = siteConfig.maintenance;

  return (
    <main className="grid min-h-svh place-items-center bg-[#FAF7F1] px-6 py-16 text-zinc-950">
      <div className="w-full max-w-2xl text-center">
        {/* Word-mark */}
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-zinc-500">
          {siteConfig.name}
        </p>

        {/* Status dot + eta */}
        {eta && (
          <p className="mt-8 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-700 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-amber-500" />
            </span>
            {eta}
          </p>
        )}

        {/* Heading */}
        <h1 className="mt-6 text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 sm:text-4xl lg:text-5xl">
          {heading}
        </h1>

        {/* Body */}
        <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-zinc-600 sm:text-base">
          {body}
        </p>

        {/* Hairline divider */}
        <div className="mx-auto mt-12 h-px w-16 bg-zinc-300" />

        {/* Contact card */}
        <section className="mx-auto mt-12 grid gap-4 sm:max-w-md">
          <a
            href={whatsappHref(`Hi ${siteConfig.name}, I'd like to enquire`)}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center justify-center gap-2 bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white transition-colors hover:bg-zinc-800"
          >
            Chat on WhatsApp
            <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </a>

          <div className="grid gap-2 text-sm text-zinc-700">
            <a
              href={mailHref(siteConfig.email)}
              className="underline-offset-4 hover:text-zinc-950 hover:underline"
            >
              {siteConfig.email}
            </a>
            <a
              href={telHref(siteConfig.phone)}
              className="underline-offset-4 hover:text-zinc-950 hover:underline"
            >
              {formatPhone(siteConfig.phone)}
            </a>
          </div>
        </section>

        {/* Address (subtle) */}
        <p className="mx-auto mt-12 max-w-md text-xs leading-relaxed text-zinc-500">
          {siteConfig.address.full}
        </p>
      </div>
    </main>
  );
}
