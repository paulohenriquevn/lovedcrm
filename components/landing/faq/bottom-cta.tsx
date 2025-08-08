import { motion } from 'framer-motion'
import { ArrowRight, HelpCircle, MessageSquare, Users } from 'lucide-react'
import { RefObject } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { scrollAnimationVariants, staggerContainer, staggerItem, buttonPressVariants } from '@/hooks/use-scroll-animation'

import { ContactOption } from './contact-option'

interface BottomCTAProps {
  ctaRef: RefObject<HTMLDivElement>
  ctaInView: boolean
}

export function BottomCTA({ ctaRef, ctaInView }: BottomCTAProps): React.ReactElement {
  return (
    <motion.div 
      ref={ctaRef}
      className="mt-16 text-center"
      initial="hidden"
      animate={ctaInView ? "visible" : "hidden"}
      variants={scrollAnimationVariants}
    >
      <Card className="max-w-4xl mx-auto bg-card border border-border shadow-sm">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold text-foreground mb-4">
            Não Encontrou sua Dúvida?
          </h3>
          <p className="text-muted-foreground mb-6 text-lg">
            Nossa equipe especializada em agências digitais está aqui para ajudar. 
            <br />
            <strong className="text-foreground">Resposta garantida em até 2 horas!</strong>
          </p>

          <motion.div 
            className="grid md:grid-cols-3 gap-4 mb-8"
            variants={staggerContainer}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
          >
            <motion.div variants={staggerItem}>
              <ContactOption 
                icon={MessageSquare}
                title="WhatsApp"
                description="Chat direto com especialista"
              />
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <ContactOption 
                icon={HelpCircle}
                title="Central de Ajuda"
                description="Documentação completa"
              />
            </motion.div>
            
            <motion.div variants={staggerItem}>
              <ContactOption 
                icon={Users}
                title="Consultoria"
                description="Call gratuita de 30min"
              />
            </motion.div>
          </motion.div>

          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div variants={buttonPressVariants} whileTap="press">
              <Button type="button" size="lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Falar com Especialista
              </Button>
            </motion.div>
            
            <motion.div variants={buttonPressVariants} whileTap="press">
              <Button type="button" size="lg" variant="outline">
                Agendar Demo Gratuita
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  )
}