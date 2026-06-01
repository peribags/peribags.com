import { cn } from "@/lib/utils";

type Post = {
  id: string;
  imageUrl: string;
  href: string;
};

const posts: Post[] = [
  {
    id: "ig1",
    imageUrl:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=70",
    href: "https://instagram.com",
  },
  {
    id: "ig2",
    imageUrl:
      "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&auto=format&fit=crop&q=70",
    href: "https://instagram.com",
  },
  {
    id: "ig3",
    imageUrl:
      "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&auto=format&fit=crop&q=70",
    href: "https://instagram.com",
  },
  {
    id: "ig4",
    imageUrl:
      "https://images.unsplash.com/photo-1564485377539-4af72d1f6a2f?w=600&auto=format&fit=crop&q=70",
    href: "https://instagram.com",
  },
  {
    id: "ig5",
    imageUrl:
      "https://images.unsplash.com/photo-1559563458-527698bf5295?w=600&auto=format&fit=crop&q=70",
    href: "https://instagram.com",
  },
  {
    id: "ig6",
    imageUrl:
      "https://images.unsplash.com/photo-1606522754091-a3bbf9ad4cb3?w=600&auto=format&fit=crop&q=70",
    href: "https://instagram.com",
  },
];

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export default function InstagramFeed() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        {/* Centered heading */}
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
            @perrybags
          </p>
          <h2 className="mt-3 text-3xl font-normal leading-[1.1] tracking-tight text-zinc-950 lg:text-4xl">
            Follow along.
          </h2>
          <p className="mt-4 text-sm text-zinc-600 sm:text-base">
            See where Perry Bags travels — from quiet workshops to city streets.
          </p>
        </div>

        {/* Grid — 3 cols mobile, 6 cols desktop */}
        <div className="mt-10 grid grid-cols-3 gap-1.5 sm:gap-2 md:mt-12 md:gap-3 lg:mt-14 lg:grid-cols-6">
          {posts.map((post, i) => (
            <a
              key={post.id}
              href={post.href}
              target="_blank"
              rel="noreferrer"
              data-aos="fade-up"
              data-aos-delay={(i % 6) * 50}
              className="group/post relative block aspect-4/5.5 overflow-hidden bg-zinc-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.imageUrl}
                alt="Instagram post"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/post:scale-[1.05]"
              />
              {/* Overlay */}
              <div
                className={cn(
                  "absolute inset-0 grid place-items-center bg-zinc-950/0 transition-colors duration-300",
                  "group-hover/post:bg-zinc-950/40",
                )}
              >
                <InstagramIcon
                  className={cn(
                    "size-6 text-white opacity-0 transition-opacity duration-300",
                    "group-hover/post:opacity-100",
                  )}
                />
              </div>
            </a>
          ))}
        </div>

        {/* Follow CTA */}
        <div className="mt-10 flex justify-center lg:mt-12" data-aos="fade-up">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-2 border border-zinc-900 px-6 py-3 text-sm font-medium tracking-tight text-zinc-900 transition-colors duration-300 hover:bg-zinc-950 hover:text-white"
          >
            <InstagramIcon className="size-4" />
            Follow on Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
