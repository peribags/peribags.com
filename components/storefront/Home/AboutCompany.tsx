import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { siteConfig } from "@/lib/site";

const OFFERINGS: { no: string; lead: string; detail: string }[] = [
  {
    no: "01",
    lead: "Lady's & Gents handbags",
    detail: "Trendy and timeless styles",
  },
  {
    no: "02",
    lead: "School & travel bags",
    detail: "Durable backpacks, sling bags, laptop bags, duffle bags",
  },
  {
    no: "03",
    lead: "Fashion accessories",
    detail: "Tote bags, clutch bags, messenger bags, waist bags",
  },
  {
    no: "04",
    lead: "Everyday essentials",
    detail:
      "Wallets, pouches, coin purses, makeup pouches & complimentary items",
  },
];

const STATS: { value: string; label: string }[] = [
  { value: "1994", label: "Established" },
  { value: "25+ yrs", label: "Experience" },
  { value: "Pan-India", label: "Wholesale reach" },
];

/** Company / wholesale "About" band for the homepage. */
export default function AboutCompany() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: "#FAF7F1" }}
    >
      {/* Decorative oversized year — sits behind, barely there */}
      <span
        aria-hidden
        className="pointer-events-none absolute -top-10 -right-6 select-none text-[26vw] font-semibold leading-none tracking-tighter text-zinc-900/[0.035] sm:text-[20vw] lg:-top-16 lg:text-[14rem]"
      >
        1994
      </span>

      <div className="relative mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[6vw]">
        {/* ── Masthead ── */}
        <div
          className="flex flex-col gap-8 border-b border-zinc-300/70 pb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-10"
          data-aos="fade-up"
        >
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              <span className="h-px w-6 bg-zinc-400" aria-hidden />
              About {siteConfig.brand}
            </p>
            <h2 className="mt-5 text-[clamp(1.9rem,4.6vw,3.4rem)] font-normal leading-[1.08] tracking-tight text-zinc-950">
              A Leading Manufacturer &amp; Wholesale Bag Dealer in Mumbai{" "}
              <span className="text-zinc-400">Since 1994.</span>
            </h2>
          </div>

          {/* Est. stamp */}
          <div
            className="hidden shrink-0 sm:block"
            data-aos="fade-up"
            data-aos-delay="80"
          >
            <div className="grid size-28 place-items-center rounded-full border border-zinc-900/20 text-center">
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.28em] text-zinc-500">
                  Est.
                </p>
                <p className="text-3xl font-medium tracking-tight text-zinc-950 tabular-nums">
                  1994
                </p>
                <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-zinc-400">
                  Mumbai
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="mt-12 grid gap-x-14 gap-y-12 lg:mt-16 lg:grid-cols-12">
          {/* Left — intro, stats, CTAs */}
          <div className="lg:col-span-5">
            <p
              className="text-base leading-relaxed text-zinc-700"
              data-aos="fade-up"
            >
              Unlock new revenue streams with {siteConfig.brand}s — your trusted
              Mumbai-based manufacturer and wholesale supplier of premium bags.
              We craft custom designs for your unique retail needs and carry a
              wide range of top-quality bags.
            </p>

            {/* Stats */}
            <dl
              className="mt-10 grid grid-cols-3 gap-4 border-y border-zinc-300/70 py-6"
              data-aos="fade-up"
              data-aos-delay="60"
            >
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-xl font-medium tracking-tight text-zinc-950 sm:text-2xl">
                    {s.value}
                  </dd>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>

            <div
              className="mt-9 flex flex-col gap-3 sm:flex-row"
              data-aos="fade-up"
              data-aos-delay="120"
            >
              <Link
                href="/contact"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-medium tracking-tight text-white transition-colors duration-300 hover:bg-zinc-800"
              >
                Contact Us
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
              <a
                href={siteConfig.catalogueUrl}
                download
                className="group inline-flex items-center justify-center gap-2 rounded-full border border-zinc-900 px-6 py-3.5 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:bg-zinc-950 hover:text-white"
              >
                <Download className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                Download catalogue
              </a>
            </div>
          </div>

          {/* Right — offerings + closing */}
          <div className="lg:col-span-7">
            <p
              className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500"
              data-aos="fade-up"
            >
              What we manufacture
            </p>

            <ul className="mt-6 grid gap-px overflow-hidden rounded-2xl bg-zinc-300/60 sm:grid-cols-2">
              {OFFERINGS.map((o, i) => (
                <li
                  key={o.lead}
                  className="group/card relative bg-[#FAF7F1] p-6 transition-colors duration-300 hover:bg-white"
                  data-aos="fade-up"
                  data-aos-delay={i * 70}
                >
                  <span
                    aria-hidden
                    className="text-sm font-medium tabular-nums text-zinc-400 transition-colors duration-300 group-hover/card:text-zinc-950"
                  >
                    {o.no}
                  </span>
                  <h3 className="mt-3 text-base font-medium tracking-tight text-zinc-950">
                    {o.lead}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
                    {o.detail}
                  </p>
                  {/* underline grows on hover */}
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-6 h-px w-0 bg-zinc-950 transition-all duration-500 ease-out group-hover/card:w-10"
                  />
                </li>
              ))}
            </ul>

            <p
              className="mt-8 text-sm leading-relaxed text-zinc-700 sm:text-base"
              data-aos="fade-up"
            >
              With{" "}
              <span className="font-medium text-zinc-950">
                over 25 years of industry experience
              </span>
              , we deliver superior quality, exceptional service, and
              competitive wholesale prices to retailers across India. Contact us
              today to explore our extensive catalogue and tailor-made solutions
              to elevate your business.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
