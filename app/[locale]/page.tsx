/**
 * Homepage - Loved CRM Landing Page V2
 * Implementação completa baseada na especificação 09-landing-page.md
 * Preserva headline exata do vision.md + todas as 15 funcionalidades PRD + diferenciação competitiva
 */

'use client'

import { CompetitiveDifferentiationSection } from '@/components/landing/competitive-differentiation-section'
import { FAQSection } from '@/components/landing/faq-section'
import { FinalCTASection } from '@/components/landing/final-cta-section'
import { Footer } from '@/components/landing/footer'
import { HeroSectionV2 } from '@/components/landing/hero-section-v2'
import { 
  PipelineVisualSection, 
  WhatsAppIntegrationSection, 
  LeadsManagementSection 
} from '@/components/landing/prd-features-sections'
import { PricingSection } from '@/components/landing/pricing-section'
import { SocialProofSectorial } from '@/components/landing/social-proof-sectorial'
import { ScrollToTop } from '@/components/ui/scroll-to-top'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Exact headline from vision.md */}
      <HeroSectionV2 />
      
      {/* PRD Core Features Sections - All 3 MVP features */}
      <PipelineVisualSection />
      <WhatsAppIntegrationSection />
      <LeadsManagementSection />
      
      {/* Sectorial Social Proof - Metrics + testimonial from spec */}
      <SocialProofSectorial />
      
      {/* Competitive Differentiation - RD Station, HubSpot, Pipedrive */}
      <CompetitiveDifferentiationSection />
      
      {/* Pricing Section - B2B tiers */}
      <PricingSection />
      
      {/* FAQ Section */}
      <FAQSection />
      
      {/* Final CTA - High conversion with urgency */}
      <FinalCTASection />
      
      {/* Footer */}
      <Footer />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
    </main>
  )
}
