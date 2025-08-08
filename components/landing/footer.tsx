/**
 * Footer - Landing Page Loved CRM
 * Footer completo otimizado para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { Separator } from '@/components/ui/separator'

import {
  FooterBrandSection,
  FooterLinksGrid,
  NewsletterSection,
  FooterBottomSection,
} from './footer-components'
import { footerSections, socialLinks } from './footer-data'

export function Footer(): JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background text-foreground">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <FooterBrandSection socialLinks={socialLinks} />

          {/* Footer Links */}
          <FooterLinksGrid sections={footerSections} />
        </div>

        {/* Newsletter Subscription */}
        <NewsletterSection />

        <Separator className="mb-8 bg-muted" />

        {/* Bottom Section */}
        <FooterBottomSection currentYear={currentYear} />
      </div>
    </footer>
  )
}
