import Link from "next/link";
import type { Route } from "next";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { RevealImage } from "@/components/storefront/Home/RevealImage";

export type EditorialStoryProps = {
  kicker?: string;
  heading: React.ReactNode;
  body: React.ReactNode;
  imageSrc: string;
  imageAlt: string;
  /** Side the image sits on at desktop. Default: "left". */
  imageSide?: "left" | "right";
  /** Optional CTA. */
  ctaHref?: Route;
  ctaLabel?: string;
  /** Section background color. Default: white. */
  background?: string;
};

export default function EditorialStory({
  kicker,
  heading,
  body,
  imageSrc,
  imageAlt,
  imageSide = "left",
  ctaHref,
  ctaLabel = "Learn more",
  background,
}: EditorialStoryProps) {
  const imageLeft = imageSide === "left";
  // Curtain slides off TOWARD the outer edge (away from the copy column).
  const slideFrom: "left" | "right" = imageLeft ? "left" : "right";

  return (
    <section style={background ? { backgroundColor: background } : undefined}>
      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-6 md:py-20 lg:px-[4vw] lg:py-[5vw]">
        <div className="grid grid-cols-12 gap-8 lg:gap-16">
          {/* Image */}
          <div
            className={cn(
              "col-span-12 lg:col-span-7",
              imageLeft ? "lg:order-1" : "lg:order-2",
            )}
          >
            <RevealImage
              src={imageSrc}
              alt={imageAlt}
              slideFrom={slideFrom}
              aspect="aspect-[4/5] sm:aspect-[5/4]"
            />
          </div>

          {/* Copy */}
          <div
            className={cn(
              "col-span-12 lg:col-span-5 lg:self-center",
              imageLeft ? "lg:order-2" : "lg:order-1",
            )}
            data-aos="fade-up"
            data-aos-delay="200"
          >
            {kicker && (
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
                {kicker}
              </p>
            )}
            <h2 className={cn(
              "text-3xl font-normal leading-[1.15] tracking-tight text-zinc-950 lg:text-4xl",
              kicker && "mt-3",
            )}>
              {heading}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-zinc-600 sm:text-base">
              {body}
            </p>
            {ctaHref && (
              <Link
                href={ctaHref}
                className="group mt-8 inline-flex items-center gap-1.5 border-b border-zinc-900 pb-0.5 text-sm font-medium tracking-tight text-zinc-900"
              >
                {ctaLabel}
                <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
