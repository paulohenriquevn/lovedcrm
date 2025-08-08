/**
 * Footer Helpers - Extracted functions and utilities
 * Reduces complexity and improves maintainability
 */

// Types
export interface FooterSection {
  title: string
  links: Array<{
    label: string
    href: string
    external?: boolean
  }>
}

export interface SocialLink {
  icon: React.ComponentType<{ className?: string }>
  href: string
  label: string
  color: string
}

export interface Certification {
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

// Global gtag function type
declare global {
  function gtag(...args: unknown[]): void
}

// Helper functions moved to outer scope
export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export const handleNewsletterSignup = (): void => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'newsletter_signup', { source: 'footer' })
  }
}