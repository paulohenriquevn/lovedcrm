import { Filter } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import type { AuditFilters as AuditFiltersType } from '../types'

interface AuditFiltersProps {
  filters: AuditFiltersType
  onFiltersChange: (filters: AuditFiltersType) => void
}

export function AuditFilters({ filters, onFiltersChange }: AuditFiltersProps) {
  const updateFilter = (key: keyof AuditFiltersType, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  return (
    <Card className="p-4">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        
        <Select value={filters.timeframe} onValueChange={(value) => updateFilter('timeframe', value)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24h</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.selectedTable} onValueChange={(value) => updateFilter('selectedTable', value)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Table" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tables</SelectItem>
            <SelectItem value="leads">Leads</SelectItem>
            <SelectItem value="organization_members">Members</SelectItem>
            <SelectItem value="communications">Communications</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.selectedAction} onValueChange={(value) => updateFilter('selectedAction', value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Actions</SelectItem>
            <SelectItem value="CREATE">Create</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="DELETE">Delete</SelectItem>
          </SelectContent>
        </Select>

        <Input
          placeholder="Search audit logs..."
          value={filters.searchTerm}
          onChange={(e) => updateFilter('searchTerm', e.target.value)}
          className="w-64"
        />
      </div>
    </Card>
  )
}