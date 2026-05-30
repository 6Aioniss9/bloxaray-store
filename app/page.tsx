import { Hero } from '@/components/site/hero'
import { FeaturedFruits } from '@/components/site/featured-fruits'
import { HowItWorks } from '@/components/site/how-it-works'
import { Testimonials } from '@/components/site/testimonials'
import { TrustSection } from '@/components/site/trust-section'

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedFruits />
      <HowItWorks />
      <Testimonials />
      <TrustSection />
    </>
  )
}
