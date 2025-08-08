import { FAQItem } from './faq-item'

interface FAQCategory {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  questions: Array<{ question: string; answer: string }>
}

interface FAQContentProps {
  activeCategoryData: FAQCategory
  activeCategory: string
  openItems: string[]
  toggleItem: (categoryId: string, questionIndex: number) => void
}

export function FAQContent({
  activeCategoryData,
  activeCategory,
  openItems,
  toggleItem,
}: FAQContentProps): React.ReactElement {
  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <activeCategoryData.icon className={`h-6 w-6 ${activeCategoryData.color}`} />
        <h3 className="text-xl font-bold text-foreground">{activeCategoryData.name}</h3>
      </div>

      <div className="space-y-4 w-full">
        {activeCategoryData.questions.map((faq, index) => {
          const itemId = `${activeCategory}-${index}`
          const isOpen = openItems.includes(itemId)

          return (
            <FAQItem
              key={`${activeCategory}-${faq.question.slice(0, 20)}`}
              faq={faq}
              isOpen={isOpen}
              onToggle={() => toggleItem(activeCategory, index)}
            />
          )
        })}
      </div>
    </div>
  )
}
