import { Download } from "lucide-react";
import { siteConfig } from "@/lib/site";

export default function CatalogueCTA() {
  const year = new Date().getFullYear();

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      {/* Soft texture wash (subtle radial gradient) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(80% 60% at 20% 20%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 60%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-24 lg:px-[4vw] lg:py-28">
        <div className="grid grid-cols-12 items-end gap-8 lg:gap-12">
          {/* Heading + description */}
          <div className="col-span-12 lg:col-span-7" data-aos="fade-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/60">
              The Edit
            </p>
            <h2 className="mt-3 text-3xl font-normal leading-[1.05] tracking-tight lg:text-5xl">
              The {year} catalogue,
              <br />free to download.
            </h2>
            <p className="mt-5 max-w-md text-sm text-white/70 sm:text-base">
              Every silhouette, finish, and material in one place. Take it
              offline, share it with a friend.
            </p>
          </div>

          {/* CTA */}
          <div
            className="col-span-12 lg:col-span-5 lg:justify-self-end"
            data-aos="fade-up"
            data-aos-delay="120"
          >
            <a
              href={siteConfig.catalogueUrl}
              download
              className="group inline-flex items-center gap-2 border border-white px-6 py-3.5 text-sm font-medium tracking-tight text-white transition-colors duration-300 hover:bg-white hover:text-zinc-950"
            >
              <Download className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              Download catalogue
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
