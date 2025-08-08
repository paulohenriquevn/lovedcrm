import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ColorPalette(): JSX.Element {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Paleta Principal - Loved Purple</CardTitle>
          <CardDescription>
            Cores primárias do sistema baseadas na psicologia de cores para agências brasileiras
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium">Primary</span>
              </div>
              <p className="text-sm text-muted-foreground">Loved Purple - Criatividade e IA</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-medium">Accent</span>
              </div>
              <p className="text-sm text-muted-foreground">Emerald - Sucesso e crescimento</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 rounded-lg bg-destructive flex items-center justify-center">
                <span className="text-destructive-foreground font-medium">Destructive</span>
              </div>
              <p className="text-sm text-muted-foreground">Red - Alertas e ações críticas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cores de Contexto</CardTitle>
          <CardDescription>Cores específicas para diferentes contextos do CRM</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-whatsapp flex items-center justify-center">
                <span className="text-white font-medium text-sm">WhatsApp</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-communication-email flex items-center justify-center">
                <span className="text-white font-medium text-sm">Email</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-communication-voip flex items-center justify-center">
                <span className="text-white font-medium text-sm">VoIP</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-16 rounded-lg bg-communication-note flex items-center justify-center">
                <span className="text-white font-medium text-sm">Notas</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
