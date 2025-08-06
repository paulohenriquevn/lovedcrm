/**
 * Homepage - Loved CRM Landing Page
 * Página principal otimizada para conversão de agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { FAQSection } from '@/components/landing/faq-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { Footer } from '@/components/landing/footer'
import { HeroSection } from '@/components/landing/hero-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { ProblemSolutionSection } from '@/components/landing/problem-solution-section'
import { SocialProofSection } from '@/components/landing/social-proof-section'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Problem/Solution Section */}
      <ProblemSolutionSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Social Proof Section */}
      <SocialProofSection />
      
      {/* Pricing Section */}
      <PricingSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Footer */}
      <Footer />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </main>
  )
}
