/**
 * Problem Solution Components - Extracted components for better maintainability
 * Reduces problem-solution-section.tsx complexity and file length
 */

'use client'

import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { staggerItem } from '@/hooks/use-scroll-animation'

interface Problem {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  metric: string
  impact: string
}

interface Solution {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  features: string[]
  benefit: string
  improvement: string
}

interface ProblemCardProps {
  problem: Problem
  index: number
}

export function ProblemCard({ problem }: ProblemCardProps): JSX.Element {
  const Icon = problem.icon

  return (
    <motion.div variants={staggerItem}>
      <Card className="h-full border-red-200 hover:border-red-300 transition-colors duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-50 rounded-full shrink-0">
              <Icon className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 text-red-900">{problem.title}</h3>
              <p className="text-muted-foreground mb-4">{problem.description}</p>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-xs">
                    {problem.metric}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-red-700">💸 {problem.impact}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

interface SolutionCardProps {
  solution: Solution
  index: number
}

export function SolutionCard({ solution }: SolutionCardProps): JSX.Element {
  const Icon = solution.icon

  return (
    <motion.div variants={staggerItem}>
      <Card className="h-full border-emerald-200 hover:border-emerald-300 transition-colors duration-300 bg-gradient-to-b from-emerald-50/50 to-white">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-emerald-100 rounded-full shrink-0">
              <Icon className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 text-emerald-900">{solution.title}</h3>
              <p className="text-muted-foreground mb-4">{solution.description}</p>
            </div>
          </div>

          <ul className="space-y-2 mb-4">
            {solution.features.map(feature => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="space-y-2 pt-4 border-t border-emerald-100">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                {solution.benefit}
              </Badge>
            </div>
            <p className="text-sm font-medium text-emerald-700">📈 {solution.improvement}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function ProblemSolutionHeader(): JSX.Element {
  return (
    <div className="text-center mb-16">
      <Badge className="mb-6 bg-orange-100 text-orange-700 border-orange-200 px-4 py-2 text-sm font-medium">
        Problema Real • Solução Prática
      </Badge>

      <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
        Os Problemas que
        <span className="text-red-600"> Toda Agência </span>
        Enfrenta
      </h2>

      <p className="text-xl text-muted-foreground mb-12 max-w-3xl mx-auto">
        Identificamos os maiores desafios das agências digitais brasileiras e criamos soluções
        específicas para cada um deles.
      </p>
    </div>
  )
}

export function TransformationBridge(): JSX.Element {
  return (
    <div className="my-16 text-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-dashed border-muted-foreground/30" />
        </div>
        <div className="relative flex justify-center">
          <Badge className="bg-primary text-primary-foreground px-6 py-2">
            Transformação Completa
          </Badge>
        </div>
      </div>

      <p className="text-muted-foreground mt-6 mb-12 max-w-2xl mx-auto">
        Veja como o Loved CRM resolve cada problema específico da sua agência com soluções práticas
        e comprovadas.
      </p>
    </div>
  )
}

export function ProblemSolutionFooter(): JSX.Element {
  return (
    <div className="mt-16 text-center">
      <div className="bg-gradient-to-r from-primary/5 to-emerald-500/5 rounded-2xl p-8 max-w-4xl mx-auto border border-primary/10">
        <h3 className="text-2xl font-bold mb-4">Resultado: +186% de ROI em 6 meses</h3>
        <p className="text-muted-foreground mb-6">
          Agências que adotaram o Loved CRM relatam aumento significativo em conversões,
          produtividade e satisfação da equipe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">+186%</div>
            <p className="text-sm text-muted-foreground">ROI médio</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 mb-2">+67%</div>
            <p className="text-sm text-muted-foreground">Conversão de leads</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">-45%</div>
            <p className="text-sm text-muted-foreground">Tempo em tarefas manuais</p>
          </div>
        </div>
      </div>
    </div>
  )
}
