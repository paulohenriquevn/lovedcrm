import { Timeline, TimelineStats, type TimelineEntry } from '@/components/crm/timeline'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface TimelineDemoProps {
  demoTimelineEntries: TimelineEntry[]
}

export function TimelineDemo({ demoTimelineEntries }: TimelineDemoProps): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline Unificada</CardTitle>
        <CardDescription>Timeline completa com todos os tipos de interações do CRM</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TimelineStats entries={demoTimelineEntries} />
        <Timeline
          entries={demoTimelineEntries}
          groupByDate={false}
          showLeadContext
          onEntryClick={(entry): void => {
            // Entry clicked - in real app, would navigate or show details
            void entry
          }}
        />
      </CardContent>
    </Card>
  )
}
