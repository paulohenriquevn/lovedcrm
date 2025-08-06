/**
 * Pipeline Kanban - CRM Pipeline Kanban Board
 * Kanban board para pipeline de vendas brasileiro
 * Baseado na especificação do agente 09-ui-ux-designer.md
 */

'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  MessageCircle,
  Calendar,
  DollarSign,
  User,
  Building2,
  Clock,
  Star,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Lead {
  id: string
  name: string
  company?: string
  email: string
  phone: string
  value: number
  source: string
  assignedTo: {
    id: string
    name: string
    avatar?: string
  }
  priority: 'low' | 'medium' | 'high'
  lastActivity: string
  nextFollowUp?: string
  tags: string[]
  description: string
}

interface PipelineStage {
  id: string
  name: string
  color: string
  count: number
  leads: Lead[]
}

type StageId = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed'

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Maria Santos',
    company: 'TechStart Ltda',
    email: 'maria@techstart.com.br',
    phone: '+55 11 99999-1234',
    value: 8500,
    source: 'WhatsApp',
    assignedTo: {
      id: '1',
      name: 'João Silva',
      avatar: '/api/placeholder/32/32'
    },
    priority: 'high',
    lastActivity: '5 min atrás',
    nextFollowUp: 'Hoje 16:00',
    tags: ['Marketing Digital', 'Urgente'],
    description: 'Interessada em campanha completa de marketing digital'
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    company: 'Inovação Corp',
    email: 'carlos@inovacao.com',
    phone: '+55 11 99999-5678',
    value: 12000,
    source: 'Site',
    assignedTo: {
      id: '2',
      name: 'Ana Costa',
      avatar: '/api/placeholder/32/32'
    },
    priority: 'medium',
    lastActivity: '2 horas atrás',
    tags: ['Social Media', 'B2B'],
    description: 'Precisa de gestão de redes sociais'
  },
  {
    id: '3',
    name: 'Fernanda Lima',
    company: 'Creative Studio',
    email: 'fernanda@creative.com.br',
    phone: '+55 11 99999-9012',
    value: 5500,
    source: 'Indicação',
    assignedTo: {
      id: '3',
      name: 'Pedro Santos',
      avatar: '/api/placeholder/32/32'
    },
    priority: 'low',
    lastActivity: '1 dia atrás',
    tags: ['Branding'],
    description: 'Quer renovar identidade visual'
  }
]

const initialStages: PipelineStage[] = [
  {
    id: 'lead',
    name: 'Lead',
    color: 'bg-gray-50 border-gray-200',
    count: 8,
    leads: [mockLeads[0]]
  },
  {
    id: 'contact',
    name: 'Contato',
    color: 'bg-blue-50 border-blue-200',
    count: 5,
    leads: [mockLeads[1]]
  },
  {
    id: 'proposal',
    name: 'Proposta',
    color: 'bg-yellow-50 border-yellow-200',
    count: 3,
    leads: [mockLeads[2]]
  },
  {
    id: 'negotiation',
    name: 'Negociação',
    color: 'bg-orange-50 border-orange-200',
    count: 2,
    leads: []
  },
  {
    id: 'closed',
    name: 'Fechado',
    color: 'bg-emerald-50 border-emerald-200',
    count: 12,
    leads: []
  }
]

interface PipelineKanbanProps {
  className?: string
}

export function PipelineKanban({ className }: PipelineKanbanProps) {
  const [stages, setStages] = useState<PipelineStage[]>(initialStages)
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null)

  const handleDragStart = (lead: Lead) => {
    setDraggedLead(lead)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetStageId: string) => {
    if (!draggedLead) return

    setStages(prevStages => {
      return prevStages.map(stage => {
        if (stage.leads.some(lead => lead.id === draggedLead.id)) {
          // Remove from current stage
          return {
            ...stage,
            leads: stage.leads.filter(lead => lead.id !== draggedLead.id),
            count: stage.count - 1
          }
        } else if (stage.id === targetStageId) {
          // Add to target stage
          return {
            ...stage,
            leads: [...stage.leads, draggedLead],
            count: stage.count + 1
          }
        }
        return stage
      })
    })

    setDraggedLead(null)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-3 w-3" />
      case 'medium':
        return <Clock className="h-3 w-3" />
      case 'low':
        return <Star className="h-3 w-3" />
      default:
        return null
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  return (
    <div className={cn("h-full", className)}>
      <div className="flex gap-6 h-full overflow-x-auto">
        {stages.map((stage) => (
          <div
            key={stage.id}
            className="min-w-[320px] flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(stage.id)}
          >
            {/* Stage Header */}
            <Card className={cn("mb-4", stage.color)}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      {stage.name}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stage.count}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Adicionar lead</span>
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Stage Content */}
            <div className="space-y-3 min-h-[600px]">
              {stage.leads.map((lead) => (
                <Card
                  key={lead.id}
                  className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
                  draggable
                  onDragStart={() => handleDragStart(lead)}
                >
                  <CardContent className="p-4">
                    {/* Lead Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground">
                          {lead.name}
                        </h4>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            {lead.company}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={getPriorityColor(lead.priority)}>
                          {getPriorityIcon(lead.priority)}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreHorizontal className="h-3 w-3" />
                              <span className="sr-only">Ações do lead</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                            <DropdownMenuItem>Editar lead</DropdownMenuItem>
                            <DropdownMenuItem>Enviar email</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              Remover lead
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Value */}
                    <div className="flex items-center gap-1 mb-2">
                      <DollarSign className="h-3 w-3 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        {formatCurrency(lead.value)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {lead.description}
                    </p>

                    {/* Contact Info */}
                    <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="truncate max-w-[120px]">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{lead.phone.slice(-8)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {lead.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {lead.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={lead.assignedTo.avatar} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {lead.assignedTo.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          {lead.assignedTo.name}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{lead.lastActivity}</span>
                      </div>
                    </div>

                    {/* Next Follow-up */}
                    {lead.nextFollowUp && (
                      <div className="mt-2 pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-orange-600">
                          <Calendar className="h-3 w-3" />
                          <span>Próximo: {lead.nextFollowUp}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="mt-3 flex gap-1">
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                        <Phone className="mr-1 h-3 w-3" />
                        Ligar
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 h-7 text-xs">
                        <MessageCircle className="mr-1 h-3 w-3" />
                        WhatsApp
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add Lead Card */}
              <Card className="border-dashed border-2 border-muted-foreground/25 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 text-center">
                  <Button variant="ghost" className="h-auto p-2 text-muted-foreground hover:text-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Lead
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}