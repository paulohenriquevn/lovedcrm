import {
  CommunicationChannelBadge,
  MessageBubble,
  WhatsAppMessage,
} from '@/components/crm/communication-channel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function CommunicationDemo(): JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Canais de Comunicação</CardTitle>
        <CardDescription>
          Badges e componentes para diferentes canais de comunicação
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-medium">Badges de Canal:</p>
          <div className="flex flex-wrap gap-3">
            <CommunicationChannelBadge channel="whatsapp" showLabel />
            <CommunicationChannelBadge channel="email" showLabel />
            <CommunicationChannelBadge channel="voip" showLabel />
            <CommunicationChannelBadge channel="note" showLabel />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Mensagens Exemplo:</p>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <MessageBubble
              content="Olá! Gostaria de saber mais sobre seus serviços de marketing digital."
              direction="inbound"
              channel="whatsapp"
              timestamp={new Date()}
              status="read"
              senderName="João Silva"
            />
            <MessageBubble
              content="Claro! Vou te enviar nossa apresentação. Qual o melhor horário para conversarmos?"
              direction="outbound"
              channel="whatsapp"
              timestamp={new Date(Date.now() - 60_000)}
              status="delivered"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium">Mensagens WhatsApp Nativas:</p>
          <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
            <WhatsAppMessage
              content="Oi! Vi que vocês trabalham com agências. Tenho uma empresa e preciso de ajuda com marketing."
              direction="inbound"
              timestamp={new Date()}
              status="read"
              senderName="Maria Santos"
            />
            <WhatsAppMessage
              content="Perfeito! Vamos agendar uma conversa para entender melhor suas necessidades. Você tem disponibilidade amanhã?"
              direction="outbound"
              timestamp={new Date(Date.now() - 120_000)}
              status="delivered"
              attachmentCount={1}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
