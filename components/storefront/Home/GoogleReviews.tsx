import { ArrowUpRight } from "lucide-react";
import {
  getGoogleReviews,
  type GoogleReview,
} from "@/lib/services/storefront/google-reviews.service";
import { cn } from "@/lib/utils";

/**
 * Live Google reviews, shown above the Instagram feed. Renders nothing unless
 * GOOGLE_PLACES_API_KEY + GOOGLE_PLACE_ID are configured and reviews exist.
 */
export default async function GoogleReviews() {
  const data = await getGoogleReviews();
  if (!data) return null;

  const reviews = data.reviews.slice(0, 6);
  if (reviews.length === 0) return null;

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            <GoogleG className="size-3.5" />
            Reviews
          </p>
          <h2 className="mt-3 text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl">
            Loved on Google.
          </h2>

          {data.rating != null && (
            <div
              className="mt-5 inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white px-4 py-2 shadow-[0_8px_24px_-16px_rgba(15,15,15,0.18)]"
              data-aos="fade-up"
              data-aos-delay="60"
            >
              <span className="text-lg font-medium tabular-nums text-zinc-950">
                {data.rating.toFixed(1)}
              </span>
              <Stars value={data.rating} className="text-base" />
              {data.total != null && (
                <span className="text-xs text-zinc-500">
                  {new Intl.NumberFormat("en-IN").format(data.total)} reviews
                </span>
              )}
            </div>
          )}
        </div>

        {/* Cards */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-6">
          {reviews.map((r, i) => (
            <ReviewCard
              key={r.id}
              review={r}
              fallbackHref={data.profileUrl}
              delay={(i % 3) * 80}
            />
          ))}
        </div>

        {/* CTA */}
        {data.profileUrl && (
          <div className="mt-10 flex justify-center lg:mt-12" data-aos="fade-up">
            <a
              href={data.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 border border-zinc-900 px-6 py-3 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:bg-zinc-950 hover:text-white"
            >
              <GoogleG className="size-4" />
              Read all reviews on Google
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  fallbackHref,
  delay,
}: {
  review: GoogleReview;
  fallbackHref: string | null;
  delay: number;
}) {
  const href = review.authorUrl || fallbackHref || undefined;

  const className = cn(
    "group/review flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 text-left shadow-[0_8px_24px_-18px_rgba(15,15,15,0.18)] transition-colors",
    href && "hover:border-zinc-300",
  );

  const inner = (
    <>
      <div className="flex items-center gap-3">
        <Avatar name={review.author} src={review.avatarUrl} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-zinc-950">
            {review.author}
          </p>
          {review.relativeTime && (
            <p className="text-xs text-zinc-500">{review.relativeTime}</p>
          )}
        </div>
        <GoogleG className="size-4 shrink-0" />
      </div>

      <Stars value={review.rating} className="mt-3 text-sm" />

      <p className="mt-3 line-clamp-6 text-sm leading-relaxed text-zinc-600">
        {review.text}
      </p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        data-aos="fade-up"
        data-aos-delay={delay}
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <div data-aos="fade-up" data-aos-delay={delay} className={className}>
      {inner}
    </div>
  );
}

function Avatar({ name, src }: { name: string; src?: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        referrerPolicy="no-referrer"
        loading="lazy"
        decoding="async"
        className="size-10 shrink-0 rounded-full object-cover"
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "G";
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-600">
      {initial}
    </span>
  );
}

// ── Stars (supports partial fill, e.g. 4.8) ───────────────────────────────────

function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className={cn("relative inline-flex leading-none", className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      <StarRow className="text-zinc-200" />
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${pct}%` }}
        aria-hidden
      >
        <StarRow className="text-amber-400" />
      </span>
    </span>
  );
}

function StarRow({ className }: { className?: string }) {
  return (
    <span className={cn("flex shrink-0", className)} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-[1em]" />
      ))}
    </span>
  );
}

function Star({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" />
    </svg>
  );
}

// ── Google "G" logo ───────────────────────────────────────────────────────────

function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.4 5.4 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.27v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29a7.21 7.21 0 0 1 0-4.58V6.62H1.27a12 12 0 0 0 0 10.76l4-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}
