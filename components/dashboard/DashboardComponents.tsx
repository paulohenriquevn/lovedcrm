import { RecentActivities } from './ActivityComponents'
import { StatsCards } from './StatsCards'
import { DashboardStats, Activity as ActivityType } from '../../types/admin'

// Export all components from the main module
export { StatsCards } from './StatsCards'
export { RecentActivities } from './ActivityComponents'

// Export individual generators and components for flexibility
export {
  createUserStatsCard,
  createActiveUsersCard,
  createRevenueCard,
  createOrganizationsCard,
  generateStatCardsData,
  StatCard,
  StatCardIcon,
  StatCardContent,
  StatCardChange,
} from './StatsCards'

export { ActivityIcon, ActivityContent, ActivityItem } from './ActivityComponents'

// Dashboard props interface
export interface DashboardComponentsProps {
  stats: DashboardStats | null
  activities: ActivityType[]
  onRefreshActivities: () => void
}

// Main dashboard layout component
export function DashboardLayout({
  stats,
  activities,
  onRefreshActivities,
}: DashboardComponentsProps): JSX.Element {
  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />
      <RecentActivities activities={activities} onRefresh={onRefreshActivities} />
    </div>
  )
}
