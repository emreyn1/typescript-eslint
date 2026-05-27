import { HeroSection } from "@/components/home/hero-section"
import { FeaturedCollection } from "@/components/home/featured-collection"
import { BrandStory } from "@/components/home/brand-story"
import { CategoryCards } from "@/components/home/category-cards"
import { ScentGuide } from "@/components/home/scent-guide"
import { Newsletter } from "@/components/home/newsletter"

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCollection />
      <BrandStory />
      <CategoryCards />
      <ScentGuide />
      <Newsletter />
    </>
  )
}
