import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { RevealImage } from "@/components/storefront/Home/RevealImage";
import { WhatsAppIcon } from "@/components/storefront/social-links";
import { siteConfig, whatsappHref } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Our Work",
  description: `A look inside ${siteConfig.name} — the bags we've made, the hands that make them, and the craft behind every stitch.`,
};

// ─────────────────────────────────────────────────────────────────────────────
// Content — edit freely. Images can be local (/public) or remote URLs.
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

type Work = {
  id: string;
  no: string;
  title: string;
  category: string;
  year: string;
  blurb: string;
  image: string;
};

const WORKS: Work[] = [
  {
    id: "heritage-collection",
    no: "01",
    title: "The Heritage Collection",
    category: "Collection",
    year: "2026",
    blurb:
      "Twelve silhouettes cut from a single batch of full-grain hides — totes, slings and satchels that share one character.",
    image: "/hero.webp",
  },
  {
    id: "everyday-totes",
    no: "02",
    title: "Everyday Totes",
    category: "Product line",
    year: "2025",
    blurb:
      "A tote engineered for the daily commute — laptop-first construction with hand-painted edges.",
    image: "/hero1.webp",
  },
  {
    id: "city-slings",
    no: "03",
    title: "City Slings",
    category: "Product line",
    year: "2025",
    blurb:
      "Compact, hands-free silhouettes that took eleven prototypes to feel effortless.",
    image: "/sling.jpg",
  },
  {
    id: "the-workshop",
    no: "04",
    title: "Inside the Workshop",
    category: "Craft",
    year: "Ongoing",
    blurb:
      "Every Peri bag passes through the same Mumbai workshop — cut, stitched, edged and checked by a small team of artisans who sign off each piece by hand. No assembly lines, no shortcuts. The slow way is the whole point.",
    image: "/19331.jpg",
  },
  {
    id: "wedding-trousseau",
    no: "05",
    title: "Trousseau Series",
    category: "Special order",
    year: "2024",
    blurb:
      "Saree covers and jewellery cases, monogrammed for wedding houses across three cities.",
    image:
      "https://images.unsplash.com/photo-1566150902887-9679ecc155ba?w=1200&auto=format&fit=crop&q=75",
  },
  {
    id: "retail-program",
    no: "06",
    title: "Retail Partner Program",
    category: "Wholesale",
    year: "2024",
    blurb:
      "Catalogue lines produced in small batches for boutiques — consistent grain, consistent colour, every run.",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&auto=format&fit=crop&q=75",
  },
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

export default function OurWorkPage() {
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

      {/* ── Gallery ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* 01 — full-bleed feature */}
        <WorkFeature work={WORKS[0]} />

        {/* 02 + 03 — asymmetric pair, second one offset down */}
        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-24 lg:gap-x-12">
          <WorkCard work={WORKS[1]} aspect="aspect-[4/5]" slideFrom="left" />
          <WorkCard
            work={WORKS[2]}
            aspect="aspect-[3/4]"
            slideFrom="right"
            className="md:mt-24"
          />
        </div>

        {/* 04 — split editorial row, sticky text */}
        <WorkSplit work={WORKS[3]} />

        {/* 05 + 06 — pair again, first offset */}
        <div className="mt-16 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-24 lg:gap-x-12">
          <WorkCard
            work={WORKS[4]}
            aspect="aspect-[3/4]"
            slideFrom="left"
            className="md:mt-24"
          />
          <WorkCard work={WORKS[5]} aspect="aspect-[4/5]" slideFrom="right" />
        </div>
      </div>

      {/* ── The making — dark chapter ────────────────────────────────────── */}
      {/* <div className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[6vw]">
          <div className="max-w-2xl" data-aos="fade-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white/50">
              The making
            </p>
            <h2 className="mt-3 text-3xl font-normal leading-[1.08] tracking-tight lg:text-5xl">
              Four steps.{" "}
              <em className="font-serif italic text-white/60">No shortcuts.</em>
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
      </div> */}

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-20 text-center md:px-6 md:py-28 lg:px-[4vw]">
        <p
          className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500"
          data-aos="fade-up"
        >
          Your turn
        </p>
        <h2
          className="mx-auto mt-4 max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-normal leading-[1.05] tracking-tight text-zinc-950"
          data-aos="fade-up"
          data-aos-delay="80"
        >
          Have something in mind?{" "}
          <em className="font-serif italic text-zinc-500">
            Let&rsquo;s make it.
          </em>
        </h2>
        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          data-aos="fade-up"
          data-aos-delay="160"
        >
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-zinc-950 px-7 py-3.5 text-sm font-medium tracking-tight text-white transition-colors duration-300 hover:bg-zinc-800"
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
            className="group inline-flex items-center gap-2 border border-zinc-300 px-7 py-3.5 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:border-zinc-900"
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
// Work blocks
// ─────────────────────────────────────────────────────────────────────────────

function WorkMeta({ work, light }: { work: Work; light?: boolean }) {
  return (
    <p
      className={cn(
        "text-[11px] font-medium uppercase tracking-[0.22em]",
        light ? "text-white/70" : "text-zinc-500",
      )}
    >
      {work.category} · {work.year}
    </p>
  );
}

/** Ghost outline numeral. */
function GhostNo({ no, className }: { no: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none select-none text-[clamp(4rem,9vw,8rem)] font-medium leading-none tracking-tight text-transparent transition-colors duration-700",
        className,
      )}
      style={{ WebkitTextStroke: "1px #d4d4d8" }}
    >
      {no}
    </span>
  );
}

/** 01 — full-width feature with caption overlay. */
function WorkFeature({ work }: { work: Work }) {
  return (
    <article className="group/feat relative" data-aos="fade-up">
      <div className="relative overflow-hidden bg-zinc-100">
        <div className="aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={work.image}
            alt={work.title}
            className="size-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/feat:scale-[1.04]"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Caption */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8 lg:p-10">
          <div className="max-w-xl">
            <WorkMeta work={work} light />
            <h2 className="mt-2 text-2xl font-medium tracking-tight text-white sm:text-3xl lg:text-4xl">
              {work.title}
            </h2>
            <p className="mt-2 hidden text-sm leading-relaxed text-white/75 sm:block">
              {work.blurb}
            </p>
          </div>
          <span
            aria-hidden
            className="hidden text-[clamp(4rem,8vw,7rem)] font-medium leading-none text-transparent sm:block"
            style={{ WebkitTextStroke: "1px rgba(255,255,255,0.4)" }}
          >
            {work.no}
          </span>
        </div>
      </div>
    </article>
  );
}

/** Standard gallery card — curtain reveal + ghost numeral. */
function WorkCard({
  work,
  aspect,
  slideFrom,
  className,
}: {
  work: Work;
  aspect: string;
  slideFrom: "left" | "right";
  className?: string;
}) {
  return (
    <article className={cn("group/card", className)} data-aos="fade-up">
      <div className="relative">
        <RevealImage
          src={work.image}
          alt={work.title}
          aspect={aspect}
          slideFrom={slideFrom}
        />
        <GhostNo
          no={work.no}
          className="absolute -top-7 right-3 z-10 group-hover/card:text-zinc-950/5 lg:-top-10"
        />
      </div>

      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <WorkMeta work={work} />
          <h2 className="mt-1.5 text-xl font-medium tracking-tight text-zinc-950 lg:text-2xl">
            <span className="relative inline-block after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-zinc-950 after:transition-transform after:duration-500 after:ease-out after:content-[''] group-hover/card:after:scale-x-100">
              {work.title}
            </span>
          </h2>
          {/* <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-600">
            {work.blurb}
          </p> */}
        </div>
        {/* <ArrowUpRight className="mt-1 size-5 shrink-0 text-zinc-300 transition-all duration-300 group-hover/card:-translate-y-0.5 group-hover/card:translate-x-0.5 group-hover/card:text-zinc-950" /> */}
      </div>
    </article>
  );
}

/** 04 — split editorial row: sticky text beside a tall reveal image. */
function WorkSplit({ work }: { work: Work }) {
  return (
    <article className="mt-16 grid gap-10 lg:mt-28 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32" data-aos="fade-up">
          <GhostNo no={work.no} className="block" />
          <WorkMeta work={work} />
          <h2 className="mt-3 text-3xl font-normal leading-[1.08] tracking-tight text-zinc-950 lg:text-5xl">
            {work.title.split(" ").slice(0, -1).join(" ")}{" "}
            <em className="font-serif italic text-zinc-500">
              {work.title.split(" ").slice(-1)}
            </em>
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base">
            {work.blurb}
          </p>
          <Link
            href="/about"
            className="group/link mt-8 inline-flex items-center gap-1.5 border-b border-zinc-900 pb-0.5 text-sm font-medium tracking-tight text-zinc-950"
          >
            Read our story
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <div className="lg:col-span-7" data-aos="fade-up" data-aos-delay="100">
        <RevealImage
          src={work.image}
          alt={work.title}
          aspect="aspect-[4/5] lg:aspect-[5/6]"
          slideFrom="right"
        />
      </div>
    </article>
  );
}
