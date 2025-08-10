import { Activity, RefreshCw, UserPlus, CreditCard, Building2, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Activity as ActivityType } from '../../types/admin'

// Activity icon component
export function ActivityIcon({ type }: { type: string }): JSX.Element {
  const icons = {
    userSignup: UserPlus,
    payment: CreditCard,
    subscription: TrendingUp,
    organization: Building2,
  }

  const Icon = icons[type as keyof typeof icons] ?? Activity

  return (
    <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-8 ring-background">
      <Icon className="h-4 w-4 text-primary-foreground" />
    </span>
  )
}

// Activity content component
export function ActivityContent({ activity }: { activity: ActivityType }): JSX.Element {
  return (
    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
      <div>
        <p className="text-sm text-muted-foreground">
          {activity.description}
          <span className="font-medium text-foreground"> {activity.title}</span>
        </p>
      </div>
      <div className="text-right text-sm whitespace-nowrap text-muted-foreground">
        {new Date(activity.timestamp).toLocaleString('pt-BR')}
      </div>
    </div>
  )
}

// Activity item component
export function ActivityItem({
  activity,
  isLast,
}: {
  activity: ActivityType
  isLast: boolean
}): JSX.Element {
  return (
    <li>
      <div className="relative pb-8">
        {!isLast && (
          <span
            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border"
            aria-hidden="true"
          />
        )}
        <div className="relative flex space-x-3">
          <div>
            <ActivityIcon type={activity.type ?? 'unknown'} />
          </div>
          <ActivityContent activity={activity} />
        </div>
      </div>
    </li>
  )
}

// Recent activities component
export function RecentActivities({
  activities,
  onRefresh,
}: {
  activities: ActivityType[]
  onRefresh: () => void
}): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atividades Recentes</CardTitle>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flow-root">
          <ul className="-mb-8">
            {activities.map((activity, activityIndex) => (
              <ActivityItem
                key={activity.id}
                activity={activity}
                isLast={activityIndex === activities.length - 1}
              />
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
