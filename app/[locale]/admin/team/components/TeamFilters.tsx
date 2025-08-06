/**
 * Team filters component for search and role filtering
 */

import { Search, Filter } from 'lucide-react'

import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { OrganizationRole } from '@/types/organization'

import { TeamFiltersProps } from '../types/TeamTypes'

export function TeamFilters({
  searchQuery,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
}: TeamFiltersProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar por nome ou email..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-10 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Filtrar por role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os roles</SelectItem>
          <SelectItem value={OrganizationRole.OWNER}>Owner</SelectItem>
          <SelectItem value={OrganizationRole.ADMIN}>Admin</SelectItem>
          <SelectItem value={OrganizationRole.MEMBER}>Member</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
