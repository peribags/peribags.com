import ReelsShowcase, { type ReelItem } from "./ReelsShowcase";
import {
  getPublishedReels,
  type PublishedReels,
} from "@/lib/services/storefront/home-reels.service";

// Used when the admin hasn't set any section heading yet, so the section keeps
// its original look out of the box.
const DEFAULT_HEADING = {
  kicker: "From the Workshop",
  heading: "In motion.",
  description: "Short films and behind-the-scenes glimpses from our workshop.",
};

/**
 * Dynamic reels carousel, managed in the admin panel. Renders nothing until at
 * least one reel is published.
 */
export default async function ReelsSection() {
  let data: PublishedReels;
  try {
    data = await getPublishedReels();
  } catch {
    return null;
  }

  if (data.reels.length === 0) return null;

  const reels: ReelItem[] = data.reels.map((r) => ({
    id: r.id,
    videoUrl: r.videoUrl,
    posterUrl: r.posterUrl,
    title: r.title,
    caption: r.caption,
    promoHref: r.promoHref,
    promoLabel: r.promoLabel,
  }));

  const headingSet = Boolean(data.kicker || data.heading || data.description);
  const headerProps = headingSet
    ? {
        kicker: data.kicker,
        heading: data.heading,
        description: data.description,
      }
    : DEFAULT_HEADING;

  return <ReelsShowcase reels={reels} {...headerProps} />;
}
