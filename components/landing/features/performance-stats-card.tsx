interface PerformanceStatsCardProps {
  icon: React.ComponentType<{ className?: string }>
  value: string
  label: string
  color: string
}

export function PerformanceStatsCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: PerformanceStatsCardProps): React.ReactElement {
  return (
    <div>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className={`text-3xl font-bold ${color}`}>{value}</span>
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}