import { motion } from 'framer-motion'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { staggerItem, cardHoverVariants } from '@/hooks/use-scroll-animation'

interface CoreFeature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  description: string
  highlights: string[]
  badge: string
  image: {
    src: string
    alt: string
    credit: string
    photographer: string
  }
}

interface CoreFeatureCardProps {
  feature: CoreFeature
  index?: number
}

export function CoreFeatureCard({ feature }: CoreFeatureCardProps): React.ReactElement {
  return (
    <motion.div variants={staggerItem} initial="rest" whileHover="hover">
      <motion.div variants={cardHoverVariants}>
        <Card className="relative overflow-hidden group bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all duration-300 h-full">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
            <Image
              src={feature.image.src}
              fill
              className="object-cover"
              sizes="400px"
              alt={feature.image.alt}
            />
          </div>

          <CardContent className="p-8 relative z-10">
            {/* Badge */}
            <Badge className="absolute top-4 right-4 text-xs font-medium bg-primary/10 text-primary border-primary/20">
              {feature.badge}
            </Badge>

            {/* Icon */}
            <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all">
              <feature.icon className="h-7 w-7 text-primary" />
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
            <p className="text-sm text-primary font-medium mb-4">{feature.subtitle}</p>

            {/* Description */}
            <p className="text-muted-foreground mb-6 leading-relaxed">{feature.description}</p>

            {/* Highlights */}
            <div className="space-y-2">
              {feature.highlights.map(highlight => (
                <div
                  key={`${feature.title}-highlight-${highlight.slice(0, 15)}`}
                  className="flex items-center gap-2 text-sm"
                >
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  <span className="text-muted-foreground">{highlight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
