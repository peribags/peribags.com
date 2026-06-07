import AboutEditorial from "@/components/storefront/Home/AboutEditorial";
import CatalogueCTA from "@/components/storefront/Home/CatalogueCTA";
import EditorialStory from "@/components/storefront/Home/EditorialStory";
import GoogleReviews from "@/components/storefront/Home/GoogleReviews";
import Hero, { type HeroBannerSlide } from "@/components/storefront/Home/Hero";
import HomeSections from "@/components/storefront/Home/HomeSections";
import InstagramFeed from "@/components/storefront/Home/InstagramFeed";
import ReelsSection from "@/components/storefront/Home/ReelsSection";
import Trustmarks from "@/components/storefront/Home/Trustmarks";
import { r2PublicUrl } from "@/lib/r2";
import { getPublishedHomeBanner } from "@/lib/services/storefront/home-banner.service";
import type { HomeBannerSlide } from "@/types";

// No caching anywhere — every request server-renders fresh.
export const dynamic = "force-dynamic";

function toHeroSlide(s: HomeBannerSlide): HeroBannerSlide {
  const cta =
    s.ctaLabel && s.ctaHref
      ? { label: s.ctaLabel, href: s.ctaHref }
      : undefined;
  return {
    id: s.id,
    desktopMedia: s.mediaUrl
      ? { type: s.mediaType, url: r2PublicUrl(s.mediaUrl) }
      : undefined,
    mobileMedia: s.mobileMediaUrl
      ? {
          type: s.mobileMediaType ?? "image",
          url: r2PublicUrl(s.mobileMediaUrl),
        }
      : undefined,
    alt: s.alt ?? "",
    kicker: s.kicker ?? undefined,
    heading: s.heading ?? undefined,
    description: s.description ?? undefined,
    cta,
  };
}

async function loadHeroBanner(): Promise<{
  slides: HeroBannerSlide[];
  heightDesktop: string | null;
  heightMobile: string | null;
}> {
  try {
    const { slides, heightDesktop, heightMobile } =
      await getPublishedHomeBanner();
    return {
      slides: slides.map(toHeroSlide),
      heightDesktop,
      heightMobile,
    };
  } catch {
    // If the banner can't be loaded (e.g. DB not configured), render nothing
    // for the hero band — no static fallback.
    return { slides: [], heightDesktop: null, heightMobile: null };
  }
}

export default async function HomePage() {
  const banner = await loadHeroBanner();
  
  

  return (
    <>
      <Hero
        slides={banner.slides}
        heightDesktop={banner.heightDesktop}
        heightMobile={banner.heightMobile}
      />

      <HomeSections />

      <AboutEditorial
        kicker="Our Craft"
        heading={
          <>
            Made by hand.
            <br />
            Made to last.
          </>
        }
        body="Every peribags bag is cut, stitched, and finished by a small team of artisans at our workshop. We work with full-grain leather chosen for character — pieces that wear in, not out."
        imageLeftSrc="https://images.peribags.com/categories/1780415681240-816010dc-5ad4-4b50-91fe-bb58f82e95bd.webp"
        imageLeftAlt="Inside our workshop"
        imageRightSrc="https://images.peribags.com/categories/1780414884097-0d2a55fe-86fa-435a-8ea2-75254898edfd.webp"
        imageRightAlt="Hand-stitched detail"
        ctaHref="/about"
        ctaLabel="Read our story"
      />

      {/* <EditorialStory
        kicker="The Material"
        heading={
          <>
            One hide.
            <br />
            Many lifetimes.
          </>
        }
        body="We pick full-grain hides for their natural marks — every bag carries a fingerprint of the animal it came from. With care, the leather darkens, softens, and earns a patina that's entirely yours."
        imageSrc="/19331.jpg"
        imageAlt="Close-up of full-grain leather"
        imageSide="right"
        ctaHref="/about"
        ctaLabel="On materials"
        background="#ffffff"
      /> */}

      <ReelsSection />

      <Trustmarks />

      <GoogleReviews />

      {/* <InstagramFeed /> */}

      <CatalogueCTA />
    </>
  );
}
