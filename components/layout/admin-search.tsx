'use client'

import { Search, Users, BarChart3, Settings, CreditCard, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import * as React from 'react'

import { Button } from '@/components/ui/button'

interface SearchItem {
  id: string
  titleKey?: string
  title?: string
  descriptionKey?: string
  description?: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  categoryKey?: string
  category?: string
  requiredFeature?: string
}

const searchItems: SearchItem[] = [
  // Navegação principal
  {
    id: 'dashboard',
    titleKey: 'dashboard',
    descriptionKey: 'dashboardDesc',
    href: '/admin',
    icon: BarChart3,
    categoryKey: 'navigation',
  },
  {
    id: 'team',
    titleKey: 'team',
    descriptionKey: 'teamDesc',
    href: '/admin/team',
    icon: Users,
    categoryKey: 'navigation',
  },
  {
    id: 'billing',
    titleKey: 'billing',
    descriptionKey: 'billingDesc',
    href: '/admin/billing',
    icon: CreditCard,
    categoryKey: 'navigation',
  },
  {
    id: 'settings',
    titleKey: 'settings',
    descriptionKey: 'settingsDesc',
    href: '/admin/settings',
    icon: Settings,
    categoryKey: 'navigation',
  },

  // Ações rápidas
  {
    id: 'invite-member',
    title: 'Convidar Membro',
    description: 'Enviar convite para novo membro',
    href: '/admin/team/invite',
    icon: Users,
    category: 'Ações',
    requiredFeature: 'team_collaboration',
  },
  {
    id: 'manage-billing',
    title: 'Gerenciar Billing',
    description: 'Alterar plano ou ver faturas',
    href: '/admin/billing',
    icon: CreditCard,
    category: 'Ações',
  },
  {
    id: 'advanced-analytics',
    title: 'Analytics Avançado',
    description: 'Relatórios detalhados e insights',
    href: '/admin/analytics',
    icon: BarChart3,
    category: 'Recursos Premium',
    requiredFeature: 'analytics',
  },
]

// Keyboard shortcut hook
function useKeyboardShortcut(setOpen: React.Dispatch<React.SetStateAction<boolean>>): void {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen(open => !open)
      }

      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])
}

// Helper function to get item field value
function getItemField(
  item: SearchItem,
  directField: string | undefined,
  keyField: string | undefined
): string {
  return (directField ?? keyField ?? '').toLowerCase()
}

// Helper function to check if item matches search term
function itemMatchesSearchTerm(item: SearchItem, searchTerm: string): boolean {
  const title = getItemField(item, item.title, item.titleKey)
  const description = getItemField(item, item.description, item.descriptionKey)
  const category = getItemField(item, item.category, item.categoryKey)

  return (
    title.includes(searchTerm) || description.includes(searchTerm) || category.includes(searchTerm)
  )
}

// Search filtering function
function filterSearchItems(items: SearchItem[], query: string): SearchItem[] {
  if (query === null || query === undefined || query.trim() === '') {
    return items
  }

  const searchTerm = query.toLowerCase()
  return items.filter(item => itemMatchesSearchTerm(item, searchTerm))
}

// Search trigger button component
function SearchTrigger({ onOpen }: { onOpen: () => void }): JSX.Element {
  return (
    <Button
      variant="outline"
      size="sm"
      className="relative h-8 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      onClick={onOpen}
    >
      <Search className="mr-2 h-4 w-4" />
      Buscar...
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}

// Search item component
function SearchItemButton({
  item,
  onSelect,
}: {
  item: SearchItem
  onSelect: (href: string) => void
}): JSX.Element {
  const Icon = item.icon
  return (
    <button
      type="button"
      key={item.id}
      onClick={() => onSelect(item.href)}
      className="w-full flex items-center space-x-3 rounded-md px-2 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
    >
      <Icon className="h-4 w-4" />
      <div>
        <p className="font-medium">{item.title}</p>
        <p className="text-xs text-muted-foreground">{item.description}</p>
      </div>
    </button>
  )
}

// Search results component
function SearchResults({
  navigationItems,
  actionItems,
  onSelect,
  tSearch,
}: {
  navigationItems: SearchItem[]
  actionItems: SearchItem[]
  onSelect: (href: string) => void
  tSearch: (key: string) => string
}): JSX.Element {
  return (
    <div className="space-y-4">
      {navigationItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Navegação</h4>
          <div className="space-y-1">
            {navigationItems.map(item => (
              <SearchItemButton key={item.id} item={item} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}

      {actionItems.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            {tSearch('quickActions') ?? 'Quick Actions'}
          </h4>
          <div className="space-y-1">
            {actionItems.map(item => (
              <SearchItemButton key={item.id} item={item} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Search modal component
function SearchModal({
  query,
  setQuery,
  filteredItems,
  navigationItems,
  actionItems,
  onClose,
  onSelect,
}: {
  query: string
  setQuery: React.Dispatch<React.SetStateAction<string>>
  filteredItems: SearchItem[]
  navigationItems: SearchItem[]
  actionItems: SearchItem[]
  onClose: () => void
  onSelect: (href: string) => void
}): JSX.Element {
  const tSearch = useTranslations('search')

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder={tSearch('placeholder')}
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="max-h-[300px] overflow-y-auto">
          {filteredItems.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">{tSearch('noResults')}</p>
          ) : (
            <SearchResults
              navigationItems={navigationItems}
              actionItems={actionItems}
              onSelect={onSelect}
              tSearch={tSearch}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export function AdminSearch(): JSX.Element {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const router = useRouter()

  useKeyboardShortcut(setOpen)

  const handleSelect = (href: string): void => {
    setOpen(false)
    setQuery('')
    void router.push(href)
  }

  const filteredItems = filterSearchItems(searchItems, query)
  const navigationItems = filteredItems.filter(item => item.category === 'Navegação')
  const actionItems = filteredItems.filter(item => item.category === 'Ações')

  return (
    <>
      <SearchTrigger onOpen={() => setOpen(true)} />
      {open === true && (
        <SearchModal
          query={query}
          setQuery={setQuery}
          filteredItems={filteredItems}
          navigationItems={navigationItems}
          actionItems={actionItems}
          onClose={() => setOpen(false)}
          onSelect={handleSelect}
        />
      )}
    </>
  )
}
