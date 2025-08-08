import { MessageSquare, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface CategorySidebarProps {
  activeCategory: string
  setActiveCategory: (category: string) => void
  categories: Array<{
    id: string
    name: string
    icon: React.ComponentType<{ className?: string }>
    color: string
  }>
}

export function CategorySidebar({ 
  activeCategory, 
  setActiveCategory, 
  categories 
}: CategorySidebarProps): React.ReactElement {
  return (
    <div className="w-full">
      <h3 className="font-semibold text-foreground mb-4">Categorias</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all duration-200 ${
              activeCategory === category.id
                ? 'bg-primary/10 text-primary border border-primary/20'
                : 'hover:bg-muted/50 text-muted-foreground'
            }`}
          >
            <category.icon className={`h-4 w-4 ${category.color}`} />
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Contact CTA */}
      <Card className="mt-8 bg-card border border-border shadow-sm">
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 text-primary mx-auto mb-3" />
          <h4 className="font-semibold text-sm mb-2">Ainda com dúvidas?</h4>
          <p className="text-xs text-muted-foreground mb-4">
            Fale com nossa equipe especializada em agências
          </p>
          <Button type="button" size="sm" className="w-full">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat ao Vivo
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}