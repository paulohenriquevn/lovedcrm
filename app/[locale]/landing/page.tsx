/**
 * Landing Page - Loved CRM
 * Página principal otimizada para conversão de agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { Suspense, lazy } from 'react'

import { HeroSection } from '@/components/landing/hero-section'
import { SectionLoading } from '@/components/loading/section-loading'

// Lazy load non-critical sections for better performance
const ProblemSolutionSection = lazy(() =>
  import('@/components/landing/problem-solution-section').then(mod => ({
    default: mod.ProblemSolutionSection,
  }))
)
const FeaturesSection = lazy(() =>
  import('@/components/landing/features-section').then(mod => ({ default: mod.FeaturesSection }))
)
const SocialProofSection = lazy(() =>
  import('@/components/landing/social-proof-section').then(mod => ({
    default: mod.SocialProofSection,
  }))
)
const PricingSection = lazy(() =>
  import('@/components/landing/pricing-section').then(mod => ({ default: mod.PricingSection }))
)
const FAQSection = lazy(() =>
  import('@/components/landing/faq-section').then(mod => ({ default: mod.FAQSection }))
)
const Footer = lazy(() =>
  import('@/components/landing/footer').then(mod => ({ default: mod.Footer }))
)

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Critical, load immediately */}
      <HeroSection />

      {/* Problem/Solution Section - Lazy loaded */}
      <Suspense fallback={<SectionLoading type="features" />}>
        <ProblemSolutionSection />
      </Suspense>

      {/* Features Section - Lazy loaded */}
      <Suspense fallback={<SectionLoading type="features" />}>
        <FeaturesSection />
      </Suspense>

      {/* Social Proof Section - Lazy loaded */}
      <Suspense fallback={<SectionLoading type="testimonials" />}>
        <SocialProofSection />
      </Suspense>

      {/* Pricing Section - Lazy loaded */}
      <Suspense fallback={<SectionLoading type="pricing" />}>
        <PricingSection />
      </Suspense>

      {/* FAQ Section - Lazy loaded */}
      <Suspense fallback={<SectionLoading type="faq" />}>
        <FAQSection />
      </Suspense>

      {/* Footer - Lazy loaded */}
      <Suspense fallback={<SectionLoading />}>
        <Footer />
      </Suspense>
    </main>
  )
}
