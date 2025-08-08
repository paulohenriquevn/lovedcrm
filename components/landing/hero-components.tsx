/**
 * Hero Section Components - Extracted sub-components
 * Reduces main component complexity and improves maintainability
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Users, Zap, Shield } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  heroAnimations,
  buttonPressVariants,
  iconBounceVariants,
} from '@/hooks/use-scroll-animation'
import { companyLogos, getImageProps } from '@/lib/images'

import { HeroDashboardMockup } from './hero-dashboard-components'
import {
  handleCreateOrganizationClick,
  handleDemoRequestClick,
  type ImageLoadingState,
  type ImageType,
} from './hero-helpers'

interface HeroHeaderProps {
  heroAnimations: typeof heroAnimations
}

export function HeroHeader({ heroAnimations }: HeroHeaderProps): JSX.Element {
  return (
    <>
      {/* Badge Setor-Específico */}
      <motion.div variants={heroAnimations.badge}>
        <Badge className="mb-6 bg-violet-50 text-violet-700 border-violet-200 px-4 py-2 text-sm font-medium">
          Especializado para Agências de 5-20 Colaboradores
        </Badge>
      </motion.div>

      {/* Headline Principal */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
        variants={heroAnimations.title}
      >
        O Único CRM que{' '}
        <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Agências Digitais Brasileiras
        </span>{' '}
        Realmente Precisam
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
        variants={heroAnimations.subtitle}
      >
        Transforme a gestão da sua agência com{' '}
        <strong className="text-primary">pipeline visual</strong>,{' '}
        <strong className="text-whatsapp">WhatsApp integrado</strong> e{' '}
        <strong className="text-ai-summary">IA em português</strong> - tudo em uma única plataforma
        moderna.
      </motion.p>
    </>
  )
}

interface HeroCTAButtonsProps {
  heroAnimations: typeof heroAnimations
  buttonPressVariants: typeof buttonPressVariants
  iconBounceVariants: typeof iconBounceVariants
}

export function HeroCTAButtons({
  heroAnimations,
  buttonPressVariants,
  iconBounceVariants,
}: HeroCTAButtonsProps): JSX.Element {
  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
      variants={heroAnimations.buttons}
    >
      <motion.div variants={buttonPressVariants} initial="rest" whileHover="hover" whileTap="press">
        <Button
          size="lg"
          className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
          onClick={handleCreateOrganizationClick}
        >
          Criar Organização Grátis
          <motion.div variants={iconBounceVariants} className="ml-2">
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </Button>
      </motion.div>

      <motion.div variants={buttonPressVariants} initial="rest" whileHover="hover" whileTap="press">
        <Button
          variant="outline"
          size="lg"
          className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
          onClick={handleDemoRequestClick}
        >
          <motion.div variants={iconBounceVariants} className="mr-2">
            <Play className="h-5 w-5" />
          </motion.div>
          Ver Demonstração
        </Button>
      </motion.div>
    </motion.div>
  )
}

interface HeroTrustIndicatorsProps {
  heroAnimations: typeof heroAnimations
}

export function HeroTrustIndicators({ heroAnimations }: HeroTrustIndicatorsProps): JSX.Element {
  return (
    <motion.div
      className="flex items-center justify-center gap-8 mb-12 text-sm text-foreground"
      variants={heroAnimations.trustIndicators}
    >
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span>500+ Agências</span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        <span>Setup em 5min</span>
      </div>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span>LGPD Nativo</span>
      </div>
    </motion.div>
  )
}

interface HeroDashboardMockupProps {
  heroAnimations: typeof heroAnimations
  imageLoading: ImageLoadingState
  handleImageLoad: (type: ImageType, index?: number) => void
}

export function HeroDashboardMockupComponent({
  heroAnimations,
  imageLoading,
  handleImageLoad,
}: HeroDashboardMockupProps): JSX.Element {
  return (
    <HeroDashboardMockup
      heroAnimations={heroAnimations}
      imageLoading={imageLoading}
      handleImageLoad={handleImageLoad}
    />
  )
}

interface HeroSocialProofProps {
  imageLoading: ImageLoadingState
  handleImageLoad: (type: ImageType, index?: number) => void
}

export function HeroSocialProof({
  imageLoading,
  handleImageLoad,
}: HeroSocialProofProps): JSX.Element {
  const logos = [
    companyLogos.pixelCreative,
    companyLogos.growthHub,
    companyLogos.digitalFirst,
    companyLogos.scaleAgency,
  ]

  return (
    <motion.div
      className="mt-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.1, duration: 0.5 }}
    >
      <p className="text-sm text-muted-foreground mb-4">Confiado por agências em todo Brasil</p>
      <div className="flex items-center justify-center gap-8 opacity-60">
        {logos.map((logo, index) => (
          <div key={logo.alt} className="relative h-8 w-24 rounded overflow-hidden">
            <AnimatePresence>
              {imageLoading.logos[index] === true ? (
                <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" />
              ) : null}
            </AnimatePresence>
            <Image
              {...getImageProps(logo, 96, 32)}
              fill
              className="object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
              sizes="96px"
              onLoad={() => handleImageLoad('logo', index)}
              alt={logo.alt}
            />
          </div>
        ))}
      </div>
    </motion.div>
  )
}
