/**
 * Hero Dashboard Components - Extracted dashboard mockup components
 * Reduces hero-components.tsx file size and improves maintainability
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

import { ImageLoading } from '@/components/loading/section-loading'
import { Badge } from '@/components/ui/badge'
import { heroImages, getImageProps } from '@/lib/images'

import type { ImageLoadingState, ImageType } from './hero-helpers'

interface HeroAnimations {
  mockup: {
    hidden: { opacity: number; y: number }
    visible: { opacity: number; y: number; transition: { duration: number; delay: number } }
  }
}

interface DashboardMockupProps {
  imageLoading: ImageLoadingState
  handleImageLoad: (type: ImageType, index?: number) => void
  heroAnimations: HeroAnimations
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

function PipelineCards(): JSX.Element {
  const pipelineStages = ['Lead', 'Contato', 'Proposta', 'Negociação', 'Fechado']

  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {pipelineStages.map((stage, index) => (
        <div key={stage} className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-xs font-medium mb-2">{stage}</h4>
          <div className="space-y-2">
            {Array.from({ length: index + 1 }, (_, i) => (
              <div
                key={`${stage}-lead-item-${i + 1}`}
                className="bg-white rounded border h-12 flex items-center px-2"
              >
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

function TimelineMockup(): JSX.Element {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium mb-3">Timeline Recente</h4>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-whatsapp rounded-full flex items-center justify-center">
            <span className="text-white text-xs">W</span>
          </div>
          <div className="flex-1 text-xs text-muted-foreground">
            Cliente interessado em marketing digital...
          </div>
          <span className="text-xs text-muted-foreground/60">5min</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-ai-summary rounded-full flex items-center justify-center">
            <span className="text-white text-xs">IA</span>
          </div>
          <div className="flex-1 text-xs text-muted-foreground">
            Resumo automático gerado: Lead qualificado, orçamento R$ 5k/mês
          </div>
          <span className="text-xs text-muted-foreground/60">8min</span>
        </div>
      </div>
    </div>
  )
}

function FeatureOverlays(): JSX.Element {
  return (
    <>
      <motion.div
        className="absolute top-20 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-lg text-sm font-medium"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        Pipeline Kanban
      </motion.div>
      <motion.div
        className="absolute top-20 right-4 bg-whatsapp text-white px-3 py-1 rounded-lg text-sm font-medium"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
      >
        WhatsApp Integrado
      </motion.div>
      <motion.div
        className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-ai-summary text-white px-3 py-1 rounded-lg text-sm font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.9, duration: 0.5 }}
      >
        IA Resumos Automáticos
      </motion.div>
    </>
  )
}

export function HeroDashboardMockup({
  heroAnimations,
  imageLoading,
  handleImageLoad,
}: DashboardMockupProps): JSX.Element {
  const mockupVariants = heroAnimations.mockup
  return (
    <motion.div className="mt-12 relative" variants={mockupVariants}>
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
            <PipelineCards />
            <TimelineMockup />
          </div>
        </div>

        <FeatureOverlays />
      </div>
    </motion.div>
  )
}
