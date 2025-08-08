/**
 * Hero Section Helpers - Extracted functions and types
 * Reduces complexity and improves maintainability
 */

// Global gtag function type
declare global {
  function gtag(...args: unknown[]): void
}

// Event handlers moved to outer scope
export const handleCreateOrganizationClick = (): void => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'cta_click', {
      ctaPosition: 'hero',
      ctaText: 'criar_organizacao_gratis',
      sector: 'agencias_digitais',
    })
  }
}

export const handleDemoRequestClick = (): void => {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'demo_request', { source: 'hero' })
  }
}

// Types
export interface ImageLoadingState {
  dashboard: boolean
  logos: boolean[]
}

export type ImageType = 'dashboard' | 'logo'
