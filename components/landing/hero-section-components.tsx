/**
 * Hero Section Components - Extracted components to reduce file size
 * Improves maintainability and reduces hero-section.tsx complexity
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Users, Zap, Shield } from 'lucide-react'
import Image from 'next/image'

import { ImageLoading } from '@/components/loading/section-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { buttonPressVariants, iconBounceVariants } from '@/hooks/use-scroll-animation'
import { heroImages, companyLogos, getImageProps } from '@/lib/images'

import { TimelineSection, FeatureHighlights } from './hero-dashboard-utils'
import { handleCreateOrganizationClick, handleDemoRequestClick } from './hero-helpers'

interface ImageLoadingState {
  dashboard: boolean
  logos: boolean[]
}

// Animation variants to replace unsafe heroAnimations
const badgeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const titleVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }
}

const subtitleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } }
}

const buttonsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.6 } }
}

const trustIndicatorsVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.8 } }
}

const mockupVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 1 } }
}

export function HeroBadge(): JSX.Element {
  return (
    <motion.div variants={badgeVariants}>
      <Badge className="mb-6 bg-violet-50 text-violet-700 border-violet-200 px-4 py-2 text-sm font-medium">
        Especializado para Agências de 5-20 Colaboradores
      </Badge>
    </motion.div>
  )
}

export function HeroHeadline(): JSX.Element {
  return (
    <>
      <motion.h1 
        className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
        variants={titleVariants}
      >
        O Único CRM que{" "}
        <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Agências Digitais Brasileiras
        </span>{" "}
        Realmente Precisam
      </motion.h1>
      
      <motion.p 
        className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
        variants={subtitleVariants}
      >
        Transforme a gestão da sua agência com{" "}
        <strong className="text-primary">pipeline visual</strong>,{" "}
        <strong className="text-whatsapp">WhatsApp integrado</strong> e{" "}
        <strong className="text-ai-summary">IA em português</strong> - 
        tudo em uma única plataforma moderna.
      </motion.p>
    </>
  )
}

export function HeroCTAButtons(): JSX.Element {
  return (
    <motion.div 
      className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
      variants={buttonsVariants}
    >
      <motion.div
        variants={buttonPressVariants}
        initial="rest"
        whileHover="hover"
        whileTap="press"
      >
        <Button 
          size="lg" 
          className="h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-300"
          onClick={handleCreateOrganizationClick}
        >
          Criar Organização Grátis
          <motion.div
            variants={iconBounceVariants}
            className="ml-2"
          >
            <ArrowRight className="h-5 w-5" />
          </motion.div>
        </Button>
      </motion.div>
      
      <motion.div
        variants={buttonPressVariants}
        initial="rest"
        whileHover="hover"
        whileTap="press"
      >
        <Button 
          variant="outline" 
          size="lg" 
          className="h-14 px-8 text-lg border-primary text-primary hover:bg-primary/10 transition-colors duration-300"
          onClick={handleDemoRequestClick}
        >
          <motion.div
            variants={iconBounceVariants}
            className="mr-2"
          >
            <Play className="h-5 w-5" />
          </motion.div>
          Ver Demonstração
        </Button>
      </motion.div>
    </motion.div>
  )
}

export function HeroTrustIndicators(): JSX.Element {
  return (
    <motion.div 
      className="flex items-center justify-center gap-8 mb-12 text-sm text-foreground"
      variants={trustIndicatorsVariants}
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

interface DashboardMockupProps {
  imageLoading: ImageLoadingState
  handleImageLoad: (type: 'dashboard' | 'logo', index?: number) => void
}

export function DashboardMockup({ imageLoading, handleImageLoad }: DashboardMockupProps): JSX.Element {
  const pipelineStages = ['Lead', 'Contato', 'Proposta', 'Negociação', 'Fechado']
  
  return (
    <motion.div 
      className="mt-12 relative"
      variants={mockupVariants}
    >
      <div className="relative max-w-5xl mx-auto">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-full aspect-[16/10] overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <AnimatePresence>
              {imageLoading.dashboard === true ? <ImageLoading className="rounded-2xl" /> : null}
            </AnimatePresence>
            <Image
              {...getImageProps(heroImages.dashboard, 1200, 800)}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 1200px"
              onLoad={() => handleImageLoad('dashboard')}
              priority
              alt="Dashboard do Loved CRM mostrando pipeline Kanban"
            />
          </div>
          
          <DashboardHeader />
          
          <div className="p-6">
            <PipelineGrid stages={pipelineStages} />
            <TimelineSection />
          </div>
        </div>
        
        <FeatureHighlights />
      </div>
    </motion.div>
  )
}

function DashboardHeader(): JSX.Element {
  return (
    <div className="bg-gray-50 px-6 py-4 border-b border-border flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">L</span>
        </div>
        <span className="font-semibold">Silva Digital Agency</span>
        <Badge className="bg-tier-pro text-white text-xs">PRO</Badge>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full" />
        <div className="h-8 w-8 bg-gray-300 rounded-full" />
        <div className="h-8 w-8 bg-gray-400 rounded-full" />
      </div>
    </div>
  )
}

function PipelineGrid({ stages }: { stages: string[] }): JSX.Element {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {stages.map((stage, index) => (
        <div key={stage} className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-medium mb-2">{stage}</h4>
          <div className="space-y-2">
            {Array.from({ length: index + 1 }, (_, i) => (
              <div key={`${stage}-lead-item-${i + 1}`} className="bg-white rounded border h-12 flex items-center px-2">
                <div className="h-2 w-2 bg-primary rounded-full mr-2" />
                <div className="text-xs text-muted-foreground">Lead {i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface SocialProofProps {
  imageLoading: ImageLoadingState
  handleImageLoad: (type: 'dashboard' | 'logo', index?: number) => void
}

export function SocialProof({ imageLoading, handleImageLoad }: SocialProofProps): JSX.Element {
  const logos = [
    companyLogos.pixelCreative,
    companyLogos.growthHub, 
    companyLogos.digitalFirst,
    companyLogos.scaleAgency
  ]
  
  return (
    <motion.div 
      className="mt-12 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.1, duration: 0.5 }}
    >
      <p className="text-sm text-muted-foreground mb-4">
        Confiado por agências em todo Brasil
      </p>
      <div className="flex items-center justify-center gap-8 opacity-60">
        {logos.map((logo, index) => (
          <div key={logo.alt} className="relative h-8 w-24 rounded overflow-hidden">
            <AnimatePresence>
              {imageLoading.logos[index] === true ? <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" /> : null}
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