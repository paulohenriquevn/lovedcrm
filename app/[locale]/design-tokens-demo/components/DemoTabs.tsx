import { BarChart3, Layers, MessageCircle, Palette, Smartphone, Sparkles } from 'lucide-react'

import { TimelineEntry } from '@/components/crm/timeline-utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AIDemo } from './AIDemo'
import { ColorPalette } from './ColorPalette'
import { CommunicationDemo } from './CommunicationDemo'
import { OrganizationDemo } from './OrganizationDemo'
import { PipelineDemo } from './PipelineDemo'
import { TimelineDemo } from './TimelineDemo'

interface DemoTabsProps {
  selectedTier: 'free' | 'pro' | 'enterprise'
  selectedStage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed'
  onTierChange: (tier: 'free' | 'pro' | 'enterprise') => void
  onStageChange: (stage: 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed') => void
  demoTimelineEntries: TimelineEntry[]
}

export function DemoTabs({
  selectedTier,
  selectedStage,
  onTierChange,
  onStageChange,
  demoTimelineEntries,
}: DemoTabsProps): JSX.Element {
  return (
    <Tabs defaultValue="colors" className="space-y-6">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="colors" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Cores
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Organização
        </TabsTrigger>
        <TabsTrigger value="pipeline" className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Pipeline
        </TabsTrigger>
        <TabsTrigger value="communication" className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4" />
          Comunicação
        </TabsTrigger>
        <TabsTrigger value="ai" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          IA
        </TabsTrigger>
        <TabsTrigger value="timeline" className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          Timeline
        </TabsTrigger>
      </TabsList>

      <TabsContent value="colors" className="space-y-6">
        <ColorPalette />
      </TabsContent>

      <TabsContent value="organization" className="space-y-6">
        <OrganizationDemo selectedTier={selectedTier} onTierChange={onTierChange} />
      </TabsContent>

      <TabsContent value="pipeline" className="space-y-6">
        <PipelineDemo selectedStage={selectedStage} onStageChange={onStageChange} />
      </TabsContent>

      <TabsContent value="communication" className="space-y-6">
        <CommunicationDemo />
      </TabsContent>

      <TabsContent value="ai" className="space-y-6">
        <AIDemo />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <TimelineDemo demoTimelineEntries={demoTimelineEntries} />
      </TabsContent>
    </Tabs>
  )
}
