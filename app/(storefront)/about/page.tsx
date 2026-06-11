import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MapPin } from "lucide-react";
import { RevealImage } from "@/components/storefront/Home/RevealImage";
import { siteConfig } from "@/lib/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About",
  description: `The story of ${siteConfig.name} — a Mumbai workshop making bags by hand since day one. The people, the principles, and the craft.`,
};

// Pure JSX, no data fetches — pre-rendered at build time, served forever
// from Vercel edge until next deploy.

// ─────────────────────────────────────────────────────────────────────────────
// Content — edit freely.
// ─────────────────────────────────────────────────────────────────────────────

const JOURNEY = [
  {
    year: "2008",
    title: "A bench in Mumbai Central",
    body: "Peri begins as a single workbench — one craftsman, one roll of hide, and orders taken over the phone.",
  },
  {
    year: "2013",
    title: "The workshop grows",
    body: "Six artisans join. The first full catalogue is printed and hand-delivered to boutiques across the city.",
  },
  {
    year: "2017",
    title: "A hundred designs",
    body: "From slings to saree covers — the catalogue crosses a hundred living designs, each still cut by hand.",
  },
  {
    year: "2022",
    title: "Beyond Mumbai",
    body: "Retail partners across India. Same bench, same hands, bigger map.",
  },
  {
    year: "2026",
    title: "peribags.com",
    body: "The workshop comes online — every piece in the catalogue, a click from your door.",
  },
];

const VALUES = [
  {
    no: "01",
    title: "Material first",
    body: "A bag can only be as honest as its hide. We choose full-grain leather for character — marks, pores and all — and let it age into something personal.",
  },
  {
    no: "02",
    title: "Slow is a feature",
    body: "Saddle stitches set by hand. Edges painted in coats, not sprayed in seconds. The slow way costs us hours and earns you years.",
  },
  {
    no: "03",
    title: "Repair over replace",
    body: "Every Peri bag is welcome back at the bench — restitched, reconditioned, returned. We'd rather fix a bag than sell you another.",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  return (
    <section className="bg-white">
      {/* Page-scoped keyframes — line-mask hero + chip pops. */}
      <style>{`
        @keyframes ab-rise {
          from { transform: translateY(112%); }
          to   { transform: translateY(0); }
        }
        @keyframes ab-fade {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ab-pop {
          from { opacity: 0; transform: scale(0.6); }
          60%  { opacity: 1; }
          to   { opacity: 1; transform: scale(1); }
        }
        .ab-line { display: block; overflow: hidden; }
        .ab-line > span {
          display: block;
          transform: translateY(112%);
          animation: ab-rise 1.1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ab-fade {
          opacity: 0;
          animation: ab-fade 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .ab-pop {
          opacity: 0;
          animation: ab-pop 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .ab-line > span { transform: none; animation: none; }
          .ab-fade, .ab-pop { opacity: 1; animation: none; }
        }
      `}</style>

      {/* ── Hero — headline with inline image chips ──────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 pt-14 pb-16 md:px-6 md:pt-20 lg:px-[4vw] lg:pt-24 lg:pb-24">
        <p
          className="ab-fade text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500"
          style={{ animationDelay: "100ms" }}
        >
          About {siteConfig.name}
        </p>

        <h1 className="mt-6 text-[clamp(2.4rem,7vw,6rem)] font-normal leading-[1.06] tracking-tight text-zinc-950">
          <span className="ab-line">
            <span style={{ animationDelay: "160ms" }}>
              We make bags
              <Chip src="/2.png" alt="A Peri sling bag" delay="900ms" />
              that carry
            </span>
          </span>
          <span className="ab-line">
            <span style={{ animationDelay: "300ms" }}>
              whole lives
              <Chip
                src="/1.png"
                alt="Hands at work in the Peri workshop"
                delay="1050ms"
              />
              <span className="font-serif text-zinc-500">by hand.</span>
            </span>
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:items-end lg:justify-between">
          <p
            className="ab-fade max-w-md text-sm leading-relaxed text-zinc-600 sm:text-base"
            style={{ animationDelay: "520ms" }}
          >
            {siteConfig.name} is a Mumbai workshop, not a factory. A small team
            of artisans cuts, stitches and finishes every piece that carries our
            name — the same way since the first bench.
          </p>
          <a
            href={siteConfig.address.mapUrl}
            target="_blank"
            rel="noreferrer"
            className="ab-fade group inline-flex items-center gap-2 text-sm font-medium tracking-tight text-zinc-950"
            style={{ animationDelay: "640ms" }}
          >
            <MapPin className="size-4 text-zinc-400 transition-colors group-hover:text-zinc-950" />
            <span className="border-b border-zinc-900 pb-0.5">
              Mumbai Central, Mumbai
            </span>
            <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* ── Manifesto — large reading text ───────────────────────────────── */}
      <div className="border-y border-zinc-100">
        <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
          <div className="mx-auto max-w-3xl" data-aos="fade-up">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              Why we exist
            </p>
            <p className="mt-6 text-xl font-light leading-[1.6] text-zinc-400 sm:text-2xl lg:text-[1.75rem]">
              Most bags are made to be replaced.{" "}
              <span className="font-normal text-zinc-950">
                Ours are made to be kept
              </span>{" "}
              — softened by commutes, scuffed by airports,{" "}
              <span className="font-normal text-zinc-950">
                repaired at the same bench that built them
              </span>
              , and handed down still holding their shape.
            </p>
          </div>
        </div>
      </div>

      {/* ── Workshop band — image + floating quote card ──────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        <div className="relative">
          <div data-aos="fade-up">
            <RevealImage
              src="https://images.peribags.com/home-banner/1780766819338-6f4a9431-75ec-4054-8464-7b0b8024be16.webp"
              alt="Artisan hands working leather at the Peri workshop"
              aspect="aspect-[16/10] sm:aspect-[16/8] lg:aspect-[16/7]"
              slideFrom="left"
            />
          </div>

          {/* Floating quote card — overlaps the image bottom edge */}
          <figure
            className="relative z-10 -mt-10 ml-4 max-w-md bg-white p-6 shadow-[0_24px_48px_-24px_rgba(15,15,15,0.25)] sm:-mt-16 sm:ml-10 sm:p-8 lg:-mt-20"
            data-aos="fade-up"
            data-aos-delay="150"
          >
            <span
              aria-hidden
              className="block font-serif text-6xl leading-none text-zinc-200"
            >
              &ldquo;
            </span>
            <blockquote className="-mt-4 text-lg font-light leading-relaxed text-zinc-900 sm:text-xl">
              A machine can place a stitch. It can&rsquo;t decide where the hide
              deserves one.
            </blockquote>
            <figcaption className="mt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
              The Peri workshop, Mumbai
            </figcaption>
          </figure>
        </div>
      </div>

      {/* ── The journey — hairline timeline ──────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 lg:px-[4vw] lg:py-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Sticky chapter title */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32" data-aos="fade-up">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                The journey
              </p>
              <h2 className="mt-3 text-3xl font-normal leading-[1.08] tracking-tight text-zinc-950 lg:text-5xl">
                One bench,{" "}
                <span className="font-serif  text-zinc-500">
                  eighteen years.
                </span>
              </h2>
            </div>
          </div>

          {/* Timeline */}
          <ol className="relative lg:col-span-8">
            <span
              aria-hidden
              className="absolute top-0 bottom-0 left-[3px] w-px bg-zinc-200"
            />
            {JOURNEY.map((m, i) => (
              <li
                key={m.year}
                className="relative pb-12 pl-10 last:pb-0"
                data-aos="fade-up"
                data-aos-delay={(i % 5) * 60}
              >
                <span
                  aria-hidden
                  className="absolute top-2 left-0 size-[7px] rounded-full bg-zinc-950"
                />
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="text-2xl font-medium tracking-tight text-zinc-950 tabular-nums sm:text-3xl">
                    {m.year}
                  </span>
                  <h3 className="text-base font-medium tracking-tight text-zinc-900 sm:text-lg">
                    {m.title}
                  </h3>
                </div>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600">
                  {m.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* ── What we believe ──────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        <div className="max-w-2xl" data-aos="fade-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            What we believe
          </p>
          <h2 className="mt-3 text-3xl font-normal leading-[1.08] tracking-tight text-zinc-950 lg:text-5xl">
            Three rules.{" "}
            <span className="font-serif text-zinc-500">Never broken.</span>
          </h2>
        </div>

        <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3 lg:mt-16 lg:gap-x-12">
          {VALUES.map((v, i) => (
            <article
              key={v.no}
              className={cn(
                "border-t border-zinc-200 pt-6",
                i === 1 && "md:mt-12",
                i === 2 && "md:mt-24",
              )}
              data-aos="fade-up"
              data-aos-delay={i * 100}
            >
              <span
                aria-hidden
                className="block text-6xl font-medium leading-none tracking-tight text-transparent lg:text-7xl"
                style={{ WebkitTextStroke: "1px #d4d4d8" }}
              >
                {v.no}
              </span>
              <h3 className="mt-5 text-xl font-medium tracking-tight text-zinc-950">
                {v.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-600">
                {v.body}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* ── Dark pull-quote chapter ──────────────────────────────────────── */}
      <div className="bg-zinc-950 text-white">
        <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-6 md:py-28 lg:px-[4vw]">
          <div className="mx-auto max-w-4xl text-center">
            <span
              aria-hidden
              className="block font-serif text-[clamp(5rem,12vw,9rem)] leading-[0.5] text-transparent"
              style={{ WebkitTextStroke: "1px rgba(255,255,255,0.3)" }}
              data-aos="fade-up"
            >
              &ldquo;
            </span>
            <p
              className="mt-8 text-[clamp(1.6rem,4.5vw,3rem)] font-light leading-[1.25] tracking-tight"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              We don&rsquo;t chase seasons. We make the bag you reach for{" "}
              <span className="font-serif text-white/60">without thinking</span>{" "}
              — for years.
            </p>
            <p
              className="mt-8 text-[11px] font-medium uppercase tracking-[0.22em] text-white/50"
              data-aos="fade-up"
              data-aos-delay="180"
            >
              The {siteConfig.name} promise
            </p>
          </div>
        </div>
      </div>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1600px] px-4 py-20 text-center md:px-6 md:py-28 lg:px-[4vw]">
        <h2
          className="mx-auto max-w-3xl text-[clamp(2rem,6vw,4.5rem)] font-normal leading-[1.05] tracking-tight text-zinc-950"
          data-aos="fade-up"
        >
          The story continues{" "}
          <span className="font-serif text-zinc-500">with yours.</span>
        </h2>
        <div
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          <Link
            href="/category"
            className="group inline-flex rounded-full items-center gap-2 bg-zinc-950 px-7 py-3.5 text-sm font-medium tracking-tight text-white transition-colors duration-300 hover:bg-zinc-800"
          >
            See what we make
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/our-work"
            className="group inline-flex rounded-full items-center gap-2 border border-zinc-300 px-7 py-3.5 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:border-zinc-900"
          >
            Browse our work
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline headline image chip — pops in after its line settles.
// ─────────────────────────────────────────────────────────────────────────────

function Chip({
  src,
  alt,
  delay,
}: {
  src: string;
  alt: string;
  delay: string;
}) {
  return (
    <span
      className="ab-pop mx-3 inline-block h-[0.72em] w-[1.6em] overflow-hidden rounded-full align-baseline"
      style={{ animationDelay: delay }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="size-full object-cover" />
    </span>
  );
}
