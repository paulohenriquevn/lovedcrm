import { motion } from 'framer-motion'
import { RefObject } from 'react'

import { Badge } from '@/components/ui/badge'
import { scrollAnimationVariants } from '@/hooks/use-scroll-animation'

interface FeaturesHeaderProps {
  headerRef: RefObject<HTMLDivElement>
  headerInView: boolean
}

export function FeaturesHeader({
  headerRef,
  headerInView,
}: FeaturesHeaderProps): React.ReactElement {
  return (
    <motion.div
      ref={headerRef}
      className="text-center mb-16"
      initial="hidden"
      animate={headerInView ? 'visible' : 'hidden'}
      variants={scrollAnimationVariants}
    >
      <Badge className="mb-4 bg-violet-50 text-violet-700 border-violet-200">
        Funcionalidades Exclusivas
      </Badge>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
        Tudo que sua{' '}
        <span className="text-primary bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Agência Brasileira
        </span>{' '}
        Precisa
      </h2>
      <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
        Desenvolvido especificamente para o mercado brasileiro. Cada funcionalidade pensada para
        resolver problemas reais das agências digitais.
      </p>
    </motion.div>
  )
}
