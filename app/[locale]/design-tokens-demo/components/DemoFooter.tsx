import { Sparkles } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function DemoFooter(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Diferenciação Competitiva
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2">Paleta Única no Mercado</h4>
            <p className="text-sm text-muted-foreground">
              Loved Purple (#8B5CF6) é única entre CRMs brasileiros, associada com criatividade e IA
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Componentes B2B Específicos</h4>
            <p className="text-sm text-muted-foreground">
              Pipeline brasileiro, WhatsApp nativo, resumos com IA em português
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Acolhimento Brasileiro</h4>
            <p className="text-sm text-muted-foreground">
              Tons mais quentes que concorrentes internacionais, linguagem local
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-2">Multi-tenant Visual</h4>
            <p className="text-sm text-muted-foreground">
              Indicadores visuais de contexto organizacional e isolamento de dados
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}