/**
 * Hero Section - Landing Page Loved CRM
 * Seção principal da landing page para agências digitais brasileiras
 * Baseado na especificação do agente 08-landing-page.md
 */

'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play, Users, Zap, Shield } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { ImageLoading } from '@/components/loading/section-loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { heroAnimations, staggerContainer, staggerItem, buttonPressVariants, iconBounceVariants } from '@/hooks/use-scroll-animation'
import { heroImages, companyLogos, getImageProps } from '@/lib/images'

declare global {
  function gtag(...args: any[]): void
}

export function HeroSection() {
  const [imageLoading, setImageLoading] = useState({
    dashboard: true,
    logos: [true, true, true, true]
  })

  const handleImageLoad = (type: 'dashboard' | 'logo', index?: number) => {
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
          O Único CRM que{" "}
          <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Agências Digitais Brasileiras
          </span>{" "}
          Realmente Precisam
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p 
          className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed"
          variants={heroAnimations.subtitle}
        >
          Transforme a gestão da sua agência com{" "}
          <strong className="text-primary">pipeline visual</strong>,{" "}
          <strong className="text-whatsapp">WhatsApp integrado</strong> e{" "}
          <strong className="text-ai-summary">IA em português</strong> - 
          tudo em uma única plataforma moderna.
        </motion.p>
        
        {/* CTAs */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          variants={heroAnimations.buttons}
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
              onClick={() => {
                if (typeof gtag !== 'undefined') {
                  gtag('event', 'cta_click', { 
                    cta_position: 'hero', 
                    cta_text: 'criar_organizacao_gratis',
                    sector: 'agencias_digitais' 
                  })
                }
              }}
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
              onClick={() => {
                if (typeof gtag !== 'undefined') {
                  gtag('event', 'demo_request', { source: 'hero' })
                }
              }}
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

        {/* Trust Indicators */}
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
        
        {/* Visual/Mockup */}
        <motion.div 
          className="mt-12 relative"
          variants={heroAnimations.mockup}
        >
          <div className="relative max-w-5xl mx-auto">
            {/* Dashboard Mockup with Real Background */}
            <div className="relative bg-white rounded-2xl shadow-2xl border border-border w-full aspect-[16/10] overflow-hidden">
              {/* Background Image */}
              <div className="absolute inset-0 opacity-5">
                <AnimatePresence>
                  {imageLoading.dashboard ? <ImageLoading className="rounded-2xl" /> : null}
                </AnimatePresence>
                <Image
                  {...getImageProps(heroImages.dashboard, 1200, 800)}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  onLoad={() => handleImageLoad('dashboard')}
                  priority
                />
              </div>
              {/* Header do Dashboard */}
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

              {/* Dashboard Content */}
              <div className="p-6">
                {/* Pipeline Cards */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                  {['Lead', 'Contato', 'Proposta', 'Negociação', 'Fechado'].map((stage, index) => (
                    <div key={stage} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-xs font-medium mb-2">{stage}</h4>
                      <div className="space-y-2">
                        {[...new Array(index + 1)].map((_, i) => (
                          <div key={i} className="bg-white rounded border h-12 flex items-center px-2">
                            <div className="h-2 w-2 bg-primary rounded-full mr-2" />
                            <div className="text-xs text-muted-foreground">Lead {i + 1}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Timeline Mockup */}
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
              </div>
            </div>
            
            {/* Overlay com destaques */}
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
          </div>
        </motion.div>

        {/* Social Proof Básico */}
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
            {[
              companyLogos.pixelCreative,
              companyLogos.growthHub, 
              companyLogos.digitalFirst,
              companyLogos.scaleAgency
            ].map((logo, index) => (
              <div key={index} className="relative h-8 w-24 rounded overflow-hidden">
                <AnimatePresence>
                  {imageLoading.logos[index] ? <div className="absolute inset-0 bg-gray-100 animate-pulse rounded" /> : null}
                </AnimatePresence>
                <Image
                  {...getImageProps(logo, 96, 32)}
                  fill
                  className="object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                  sizes="96px"
                  onLoad={() => handleImageLoad('logo', index)}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.section>
  )
}