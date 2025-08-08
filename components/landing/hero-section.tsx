/**
 * Hero Section - Landing Page Loved CRM (Refactored)
 * Seção principal da landing page para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

import { heroAnimations, staggerContainer, buttonPressVariants, iconBounceVariants } from '@/hooks/use-scroll-animation'

import { HeroBadge, HeroHeadline, HeroCTAButtons, HeroTrustIndicators, DashboardMockup, SocialProof } from './hero-section-components'

interface ImageLoadingState {
  dashboard: boolean
  logos: boolean[]
}

export function HeroSection(): JSX.Element {
  const [imageLoading, setImageLoading] = useState<ImageLoadingState>({
    dashboard: true,
    logos: [true, true, true, true]
  })

  const handleImageLoad = (type: 'dashboard' | 'logo', index?: number): void => {
    if (type === 'dashboard') {
      setImageLoading(prev => ({ ...prev, dashboard: false }))
    } else if (type === 'logo' && typeof index === 'number') {
      setImageLoading(prev => ({
        ...prev,
        logos: prev.logos.map((loading, i) => i === index ? false : loading)
      }))
    }
  }

  return (
    <motion.section 
      className="py-20 px-4 text-center bg-gradient-to-b from-background via-violet-50/30 to-background"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <div className="max-w-7xl mx-auto">
        <HeroBadge heroAnimations={heroAnimations} />
        <HeroHeadline heroAnimations={heroAnimations} />
        <HeroCTAButtons 
          heroAnimations={heroAnimations}
          buttonPressVariants={buttonPressVariants}
          iconBounceVariants={iconBounceVariants}
        />
        <HeroTrustIndicators heroAnimations={heroAnimations} />
        <DashboardMockup 
          imageLoading={imageLoading}
          handleImageLoad={handleImageLoad}
          heroAnimations={heroAnimations}
        />
        <SocialProof 
          imageLoading={imageLoading}
          handleImageLoad={handleImageLoad}
        />
      </div>
    </motion.section>
  )
}