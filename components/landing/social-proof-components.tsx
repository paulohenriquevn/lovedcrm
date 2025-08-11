/**
 * Social Proof Components - Extracted social proof components
 * Reduces social-proof-section.tsx complexity and file length
 */

'use client'

import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { Star, Quote, TrendingUp, Users, Award, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { staggerItem } from '@/hooks/use-scroll-animation'
import { companyLogos, getImageProps } from '@/lib/images'

// Local fallback variant with proper typing
const fallbackStaggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

interface Testimonial {
  id: number
  name: string
  role: string
  company: string
  location: string
  avatar: {
    src: string
    alt: string
    credit: string
    photographer: string
  }
  rating: number
  quote: string
  results: string
  tier: string
  teamSize: string
}

interface TestimonialCardProps {
  testimonial: Testimonial
}

export function TestimonialCard({ testimonial }: TestimonialCardProps): JSX.Element {
  return (
    <motion.div variants={staggerItem ?? fallbackStaggerItem}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={testimonial.avatar.src} alt={testimonial.avatar.alt} />
              <AvatarFallback>
                {testimonial.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{testimonial.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {testimonial.tier}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
              <p className="text-sm text-muted-foreground font-medium">{testimonial.company}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-3">
            {Array.from({ length: testimonial.rating }, (_, starIndex) => (
              <Star
                key={`star-${testimonial.id}-rating-${starIndex + 1}`}
                className="h-4 w-4 fill-yellow-400 text-yellow-400"
              />
            ))}
          </div>

          <blockquote className="text-muted-foreground mb-4 italic relative">
            <Quote className="h-4 w-4 absolute -top-1 -left-1 text-muted-foreground/30" />
            <span className="pl-3">&ldquo;{testimonial.quote}&rdquo;</span>
          </blockquote>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">{testimonial.results}</span>
            </div>

            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="text-xs">{testimonial.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span className="text-xs">{testimonial.teamSize}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: string
  description: string
  color: string
}

export function MetricCard({
  icon: Icon,
  value,
  description,
  color,
}: MetricCardProps): JSX.Element {
  return (
    <motion.div variants={staggerItem ?? fallbackStaggerItem}>
      <Card className="text-center hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className={`inline-flex p-3 rounded-full mb-4 ${color}`}>
            <Icon className="h-8 w-8" />
          </div>
          <div className="text-3xl font-bold mb-2">{value}</div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface CompanyLogosProps {
  imageLoading: boolean[]
  handleImageLoad: (index: number) => void
}

export function CompanyLogos({ imageLoading, handleImageLoad }: CompanyLogosProps): JSX.Element {
  const logos = [
    companyLogos.pixelCreative,
    companyLogos.growthHub,
    companyLogos.digitalFirst,
    companyLogos.creativeLab,
    companyLogos.scaleAgency,
    companyLogos.brandBoost,
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center opacity-60">
      {logos.map((logo, logoIndex) => (
        <div key={logo.alt} className="relative h-12 w-20 mx-auto">
          <AnimatePresence>
            {imageLoading[logoIndex] === true ? (
              <div className="absolute inset-0 bg-muted animate-pulse rounded" />
            ) : null}
          </AnimatePresence>
          <Image
            {...getImageProps(logo, 80, 48)}
            fill
            className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
            sizes="80px"
            onLoad={() => handleImageLoad(logoIndex)}
            alt={logo.alt}
          />
        </div>
      ))}
    </div>
  )
}

export function SocialProofHeader(): JSX.Element {
  return (
    <div className="text-center mb-16">
      <Badge className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 px-4 py-2 text-sm font-medium">
        Prova Social • Resultados Reais
      </Badge>

      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
        Agências que
        <span className="text-emerald-600"> Triplicaram </span>
        seus Resultados
      </h2>

      <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
        Mais de 500+ agências digitais brasileiras já transformaram seus processos e aumentaram
        significativamente suas conversões com o Loved CRM.
      </p>
    </div>
  )
}

interface SocialProofMetricsProps {
  metrics: Array<{
    icon: React.ComponentType<{ className?: string }>
    value: string
    description: string
    color: string
  }>
}

export function SocialProofMetrics({ metrics }: SocialProofMetricsProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
      {metrics.map(metric => (
        <MetricCard
          key={metric.description}
          icon={metric.icon}
          value={metric.value}
          description={metric.description}
          color={metric.color}
        />
      ))}
    </div>
  )
}

interface SocialProofFooterProps {
  imageLoading: boolean[]
  handleImageLoad: (index: number) => void
}

export function SocialProofFooter({
  imageLoading,
  handleImageLoad,
}: SocialProofFooterProps): JSX.Element {
  const [showMore, setShowMore] = useState(false)

  const toggleShowMore = (): void => {
    setShowMore(!showMore)
  }

  return (
    <div className="mt-16">
      <div className="text-center mb-12">
        <h3 className="text-2xl font-bold mb-4">Confiado pelas Melhores Agências do Brasil</h3>
        <p className="text-muted-foreground mb-8">
          Agências de todos os tamanhos escolhem o Loved CRM
        </p>
      </div>

      <AnimatePresence>
        {showMore === true ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-8"
          >
            <CompanyLogos imageLoading={imageLoading} handleImageLoad={handleImageLoad} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="text-center">
        <Button variant="outline" onClick={toggleShowMore}>
          {showMore ? 'Ver Menos' : 'Ver Todas as Empresas'}
        </Button>
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full">
          <Award className="h-4 w-4 text-yellow-500" />
          <span className="text-sm font-medium">Nota 4.9/5 baseada em 247 avaliações</span>
        </div>
      </div>
    </div>
  )
}
