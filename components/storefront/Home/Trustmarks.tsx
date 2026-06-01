// Inline icons keep us independent of the installed lucide-react version,
// which is too old to ship many glyphs.

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.8 2c1 5 .5 10-2.5 13.5C16.31 18.4 13.5 20 11 20Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  );
}

function NeedleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="m12 19 7-7 3 3-7 7-3-3z" />
      <path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
      <path d="m2 2 7.586 7.586" />
      <circle cx="11" cy="11" r="2" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 13c0 5-3.5 7.5-8 8.5-4.5-1-8-3.5-8-8.5V6l8-3 8 3v7Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

const items = [
  {
    Icon: LeafIcon,
    kicker: "01",
    title: "Full-grain leather",
    description:
      "Sourced from tanneries we know. Selected piece by piece for grain and depth.",
  },
  {
    Icon: NeedleIcon,
    kicker: "02",
    title: "Hand-stitched",
    description:
      "Cut and saddle-stitched by hand at our workshop. Slow, steady, and quietly precise.",
  },
  {
    Icon: ShieldIcon,
    kicker: "03",
    title: "Lifetime repairs",
    description:
      "Bring your bag back any time. We'll restitch, recondition, and return it.",
  },
];

export default function Trustmarks() {
  return (
    <section style={{ backgroundColor: "#FAF7F1" }}>
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            Why Perry Bags
          </p>
          <h2 className="mt-3 text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl">
            Made with care, kept for a lifetime.
          </h2>
        </div>

        {/* Centered grid */}
        <div className="mt-14 grid grid-cols-1 gap-12 md:mt-16 md:grid-cols-3 md:gap-8 lg:mt-20 lg:gap-12">
          {items.map(({ Icon, kicker, title, description }, i) => (
            <div
              key={kicker}
              className="flex flex-col items-center text-center"
              data-aos="fade-up"
              data-aos-delay={120 + i * 120}
            >
              {/* Icon in outlined circle with white inner — pops softly against the cream bg */}
              <div className="grid size-16 place-items-center rounded-full border border-zinc-900/20 bg-white text-zinc-900 shadow-[0_8px_24px_-16px_rgba(15,15,15,0.18)]">
                <Icon className="size-7" />
              </div>
              <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-400 tabular-nums">
                {kicker}
              </p>
              <h3 className="mt-1.5 text-lg font-medium tracking-tight text-zinc-950 lg:text-xl">
                {title}
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-zinc-600">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
