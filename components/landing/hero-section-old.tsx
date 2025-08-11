/**
 * Hero Section - Landing Page Loved CRM
 * Seção principal da landing page para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion, type Variants } from 'framer-motion'
import { useState } from 'react'

import { staggerContainer } from '@/hooks/use-scroll-animation'

import {
  HeroBadgeSection,
  HeroHeadingSection,
  HeroCTASection,
  HeroTrustSection,
  HeroDashboardSection,
  HeroSocialProofSection,
} from './hero-section-old-components'

// Local fallback variant with proper typing
const fallbackStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
}

declare global {
  function gtag(...args: unknown[]): void
}

export function HeroSection(): JSX.Element {
  const [imageLoading, setImageLoading] = useState({
    dashboard: true,
    logos: [true, true, true, true],
  })

  const handleImageLoad = (type: 'dashboard' | 'logo', index?: number): void => {
    if (type === 'dashboard') {
      setImageLoading(prev => ({ ...prev, dashboard: false }))
    } else if (type === 'logo' && typeof index === 'number') {
      setImageLoading(prev => ({
        ...prev,
        logos: prev.logos.map((loading, i) => (i === index ? false : loading)),
      }))
    }
  }

  return (
    <motion.section
      className="py-20 px-4 text-center bg-gradient-to-b from-background via-violet-50/30 to-background"
      initial="hidden"
      animate="visible"
      variants={staggerContainer ?? fallbackStaggerContainer}
    >
      <div className="max-w-7xl mx-auto">
        <HeroBadgeSection />
        <HeroHeadingSection />
        <HeroCTASection />
        <HeroTrustSection />
        <HeroDashboardSection imageLoading={imageLoading} handleImageLoad={handleImageLoad} />
        <HeroSocialProofSection imageLoading={imageLoading} handleImageLoad={handleImageLoad} />
      </div>
    </motion.section>
  )
}
