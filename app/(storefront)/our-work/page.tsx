import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { WhatsAppIcon } from "@/components/storefront/social-links";
import {
  getPublishedOurWork,
  type PublishedOurWorkItem,
} from "@/lib/services/storefront/our-work.service";
import { siteConfig, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Work",
  description: `A look inside ${siteConfig.name} — the bags we've made, the hands that make them, and the craft behind every stitch.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Page-level static content — stats, marquee strip, process steps.
// Work cards are loaded from the DB (admin: Storefront → Our Work).
// ─────────────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "15+", label: "Years of craft" },
  { value: "200+", label: "Designs produced" },
  { value: "40k+", label: "Bags delivered" },
  { value: "100+", label: "Retail partners" },
];

const MARQUEE_WORDS = [
  "Handcrafted in Mumbai",
  "Full-grain leather",
  "Small-batch",
  "Saddle-stitched",
  "Built to outlast trends",
  "Made with care",
];

const PROCESS = [
  {
    no: "01",
    title: "Select",
    body: "Full-grain hides chosen piece by piece for grain, depth and character.",
  },
  {
    no: "02",
    title: "Cut",
    body: "Patterns traced and cut by hand — every panel from the best of the hide.",
  },
  {
    no: "03",
    title: "Stitch",
    body: "Saddle-stitched seams that hold even if a thread ever gives way.",
  },
  {
    no: "04",
    title: "Finish",
    body: "Edges painted, hardware set, and a final once-over before it ships.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default async function OurWorkPage() {
  const works = await getPublishedOurWork();

  return (
    <section className="bg-white">
      {/* Page-scoped keyframes — line-mask hero reveal + craft marquee. */}
      <style>{`
        @keyframes ow-rise {
          from { transform: translateY(112%); }
          to   { transform: translateY(0); }
        }
        @keyframes ow-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ow-marquee {
          from { transform: translate3d(0, 0, 0); }
          to   { transform: translate3d(-50%, 0, 0); }
        }
        .ow-line { display: block; overflow: hidden; }
        .ow-line > span {
          display: block;
          transform: translateY(112%);
          animation: ow-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ow-fade {
          opacity: 0;
          animation: ow-fade 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ow-marquee-track {
          animation: ow-marquee 32s linear infinite;
        }
        .ow-marquee:hover .ow-marquee-track { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) {
          .ow-line > span { transform: none; animation: none; }
          .ow-fade { opacity: 1; animation: none; }
          .ow-marquee-track { animation: none; }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-14 pb-16 md:px-6 md:pt-20 lg:px-[4vw] lg:pt-24 lg:pb-24">
        <p
          className="ow-fade text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500"
          style={{ animationDelay: "120ms" }}
        >
          Our Work
        </p>

        <h1 className="mt-5 text-[clamp(2.6rem,8vw,6.5rem)] font-normal leading-[1.02] tracking-tight text-zinc-950">
          <span className="ow-line">
            <span style={{ animationDelay: "180ms" }}>Cut. Stitched.</span>
          </span>
          <span className="ow-line">
            <span style={{ animationDelay: "320ms" }}>
              <span className="font-serif text-zinc-500">Carried</span>{" "}
              everywhere.
            </span>
          </span>
        </h1>

        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <p
            className="ow-fade max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base lg:col-span-5"
            style={{ animationDelay: "520ms" }}
          >
            A working record of what leaves our Mumbai workshop — collections,
            small batches, special orders, and the craft that holds them
            together.
          </p>

          {/* Stats strip */}
          <dl
            className="ow-fade grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4 lg:col-span-7"
            style={{ animationDelay: "640ms" }}
          >
            {STATS.map((s) => (
              <div key={s.label} className="border-l border-zinc-200 pl-4">
                <dd className="text-2xl font-medium tracking-tight text-zinc-950 tabular-nums sm:text-3xl">
                  {s.value}
                </dd>
                <dt className="mt-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                  {s.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Craft marquee ────────────────────────────────────────────────── */}
      <Marquee />

      {/* ── Work cards — logo · product picture · short description ─────── */}
      {works.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
          <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
            {works.map((work, i) => (
              <WorkCard
                key={work.id}
                work={work}
                delay={(i % 3) * 100}
                // Middle column drops a step for an editorial rhythm.
                className={cn(i % 3 === 1 && "")}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── The making — dark chapter ────────────────────────────────────── */}
      <div className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[6vw]">
          <div className="max-w-2xl" data-aos="fade-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
              The making
            </p>
            <h2 className="mt-3 text-3xl font-normal leading-[1.08] tracking-tight lg:text-5xl">
              Four steps.{" "}
              <span className="font-serif text-white/60">No shortcuts.</span>
            </h2>
          </div>

          <ol className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <li
                key={step.no}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="border-t border-white/15 pt-5"
              >
                <span
                  aria-hidden
                  className="block text-5xl font-medium leading-none tracking-tight text-transparent lg:text-6xl"
                  style={{ WebkitTextStroke: "1px rgba(255,255,255,0.35)" }}
                >
                  {step.no}
                </span>
                <h3 className="mt-4 text-lg font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-20 text-center md:px-6 md:py-28 lg:px-[4vw]">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500"
          data-aos="fade-up"
        >
          Your turn
        </p>
        <h2
          className="mx-auto  mt-4 max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-normal leading-[1.05] tracking-tight text-zinc-950"
          data-aos="fade-up"
          data-aos-delay="80"
        >
          Have something in mind?{" "}
          <span className="font-serif text-zinc-500">Let&rsquo;s make it.</span>
        </h2>
        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          data-aos="fade-up"
          data-aos-delay="160"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center rounded-full gap-2 bg-zinc-950 px-7 py-3.5 text-sm font-medium tracking-tight text-white transition-colors duration-300 hover:bg-zinc-800"
          >
            Start an enquiry
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <a
            href={whatsappHref(
              "Hi Peri Bags! I'd like to talk about a custom order.",
            )}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center rounded-full gap-2 border border-zinc-300 px-7 py-3.5 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:border-zinc-900"
          >
            <WhatsAppIcon className="size-4" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Marquee — slow, continuous craft words. Pauses on hover.
// ─────────────────────────────────────────────────────────────────────────────

function Marquee() {
  const items = [...MARQUEE_WORDS, ...MARQUEE_WORDS];
  return (
    <div className="ow-marquee overflow-hidden border-y border-zinc-200 py-4 select-none">
      <div className="ow-marquee-track flex w-max items-center">
        {[0, 1].map((half) => (
          <div
            key={half}
            className="flex shrink-0 items-center"
            aria-hidden={half === 1}
          >
            {items.map((w, i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center text-[11px] font-medium uppercase tracking-[0.28em] text-zinc-500"
              >
                <span className="px-6">{w}</span>
                <span className="text-zinc-300">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Work card — logo plate floating over the product picture, description below.
// ─────────────────────────────────────────────────────────────────────────────

function WorkCard({
  work,
  delay,
  className,
}: {
  work: PublishedOurWorkItem;
  delay: number;
  className?: string;
}) {
  return (
    <article
      className={cn("group/card", className)}
      data-aos="fade-up"
      data-aos-delay={delay}
    >
      {/* Product picture */}
      <div className="relative">
        <div className="overflow-hidden bg-zinc-100">
          <div className="aspect-[4/5]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={work.imageUrl}
              alt={work.name}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.05]"
            />
          </div>
        </div>

        {/* Logo plate — floats over the picture's bottom edge */}
        <div className="absolute -bottom-6 left-4 z-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:-translate-y-1.5">
          <span className="flex h-24 min-w-20 px-2 py-4 rounded-lg items-center justify-center bg-white px-5 shadow-[0_16px_32px_-16px_rgba(15,15,15,0.3)]">
            {work.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={work.logoUrl}
                alt={`${work.name} logo`}
                className="h-full w-auto max-w-32 object-contain"
              />
            ) : (
              <span className="font-serif text-sm tracking-[0.14em] text-zinc-950 uppercase">
                {work.name}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Short description */}
      <div className="mt-10 flex items-start justify-between gap-4">
        <p className="max-w-sm text-sm leading-relaxed text-zinc-600">
          {work.description}
        </p>
      </div>
    </article>
  );
}
