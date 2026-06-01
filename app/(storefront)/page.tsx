import Categories from "@/components/storefront/Home/Categories";
import CatalogueCTA from "@/components/storefront/Home/CatalogueCTA";
import EditorialStory from "@/components/storefront/Home/EditorialStory";
import Hero from "@/components/storefront/Home/Hero";
import InstagramFeed from "@/components/storefront/Home/InstagramFeed";
import ProductShowcase from "@/components/storefront/Home/ProductShowcase";
import ReelsShowcase from "@/components/storefront/Home/ReelsShowcase";
import Trustmarks from "@/components/storefront/Home/Trustmarks";
import { newArrivals } from "@/lib/new-arrivals";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Categories />
      <ProductShowcase
        kicker="Just In"
        heading="New Arrivals"
        background="#ffffff"
        products={newArrivals}
        limit={5}
      />

      <ProductShowcase
        kicker="Most Loved"
        heading="Best Sellers"
        background="#ffffff"
        products={newArrivals}
        limit={10}
      />

      <EditorialStory
        kicker="Our Craft"
        heading={
          <>
            Made by hand.
            <br />
            Made to last.
          </>
        }
        body="Every Perry Bag is cut, stitched, and finished by a small team of artisans at our workshop. We work with full-grain leather chosen for character — pieces that wear in, not out."
        imageSrc="/19331.jpg"
        imageAlt="Hands working leather at the Perry Bags workshop"
        ctaHref="/about"
        ctaLabel="Read our story"
      />

      <EditorialStory
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
      />

      <Trustmarks />

      <ReelsShowcase />

      <InstagramFeed />

      <CatalogueCTA />
    </>
  );
}
