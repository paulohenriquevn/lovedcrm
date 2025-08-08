import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'

interface FAQItemProps {
  faq: { question: string; answer: string }
  isOpen: boolean
  onToggle: () => void
}

export function FAQItem({ 
  faq, 
  isOpen, 
  onToggle 
}: FAQItemProps): React.ReactElement {
  return (
    <Card className="w-full overflow-hidden bg-card border border-border hover:border-primary/10 hover:shadow-md transition-all duration-300">
      <CardContent className="p-0 w-full">
        <motion.button
          type="button"
          onClick={onToggle}
          className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <h4 className="font-semibold text-foreground flex-1 pr-4">
            {faq.question}
          </h4>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className={`h-5 w-5 ${isOpen ? 'text-primary' : 'text-muted-foreground'} flex-shrink-0`} />
          </motion.div>
        </motion.button>
        
        <AnimatePresence>
          {isOpen ? (
            <motion.div 
              className="w-full px-6 pb-6 border-t border-border bg-muted/20"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <p className="text-muted-foreground leading-relaxed pt-4">
                {faq.answer}
              </p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}