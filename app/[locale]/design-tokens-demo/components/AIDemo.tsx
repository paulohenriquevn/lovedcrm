import { AISummary, AISummaryCompact } from '@/components/crm/ai-summary'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AIDemo(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumos com IA</CardTitle>
        <CardDescription>
          Componentes para exibir resumos gerados por inteligência artificial
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AISummary
          summary="O cliente demonstrou forte interesse nos serviços de marketing digital. Mencionou ter uma agência pequena e busca parceria para escalar. Orçamento estimado entre R$ 5-10k/mês. Urgência alta - quer começar ainda este mês."
          confidence={92}
          sentiment="positive"
          nextActions={[
            'Agendar call para entender melhor as necessidades',
            'Preparar proposta customizada para agências',
            'Enviar cases similares de sucesso',
          ]}
          modelUsed="gpt-4"
          tokensUsed={1247}
          expandable
          onRegenerate={() => alert('Regenerar resumo')}
          onCopy={() => alert('Resumo copiado!')}
        />

        <div className="space-y-4">
          <p className="text-sm font-medium">Versão Compacta:</p>
          <AISummaryCompact
            summary="Cliente interessado em parceria. Budget R$ 5-10k/mês, urgência alta."
            confidence={85}
          />
        </div>
      </CardContent>
    </Card>
  )
}
