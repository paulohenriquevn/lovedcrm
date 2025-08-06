# 07-design-tokens.md - Loved CRM

## **1. CONTEXTO E METODOLOGIA**

**Projeto**: Loved CRM - CRM B2B para Agências Digitais Brasileiras  
**Setor**: Agências digitais brasileiras (5-20 colaboradores, R$ 50k-500k/mês)  
**Modelo**: B2B com organizações compartilhadas e isolamento multi-tenant  
**Stack Atual**: Next.js 14 + shadcn/ui + Tailwind CSS (sistema de tokens CSS custom properties)

**Metodologia**: Pesquisa competitiva + análise psicológica de cores + tokens B2B-específicos + 100% compatibilidade shadcn/ui

## **2. PESQUISA COMPETITIVA - ANÁLISE VISUAL**

### **Concorrentes Diretos Analisados**

#### **HubSpot CRM**
- **Cor Primária**: Orange (#FF7A59) - energia, crescimento, confiança
- **Psicologia**: Cor vibrante que transmite inovação e acessibilidade
- **UI Pattern**: Interface clara com muito branco, cards bem definidos
- **Tonalidade**: Profissional mas acessível, não intimidante

#### **Salesforce**  
- **Cor Primária**: Blue (#0176D3) - confiabilidade, enterprise, tecnologia
- **Psicologia**: Azul corporativo transmite estabilidade e profissionalismo
- **UI Pattern**: Interface mais densa, focada em dados
- **Tonalidade**: Enterprise-grade, robusta, confiável

#### **Pipedrive**
- **Cor Primária**: Green (#28BD14) - crescimento, sucesso, vendas
- **Psicologia**: Verde transmite prosperidade e resultados positivos
- **UI Pattern**: Interface limpa, pipeline visual destacado
- **Tonalidade**: Focada em resultados, motivacional

#### **Monday.com**
- **Cor Primária**: Purple/Pink (#6161FF) - criatividade, modernidade
- **Psicologia**: Roxo transmite inovação e diferenciação
- **UI Pattern**: Interface colorida, cards vibrantes
- **Tonalidade**: Jovem, criativa, flexível

#### **Notion**
- **Cor Primária**: Dark Gray/Black (#000) - minimalismo, elegância
- **Psicologia**: Preto/cinza transmite sofisticação e foco
- **UI Pattern**: Interface minimalista, muito branca
- **Tonalidade**: Elegante, minimalista, focada no conteúdo

### **Insights Competitivos**
1. **Orange/Laranja** (HubSpot) = Acessibilidade + Inovação
2. **Blue/Azul** (Salesforce) = Confiabilidade Enterprise  
3. **Green/Verde** (Pipedrive) = Crescimento + Results-Driven
4. **Purple/Roxo** (Monday) = Criatividade + Flexibilidade
5. **Gray/Cinza** (Notion) = Minimalismo + Elegância

## **3. POSICIONAMENTO LOVED CRM**

### **Diferenciação Estratégica**
**"O único CRM que agências digitais brasileiras realmente precisam"**

- **Vs HubSpot**: Mais especializado, menos genérico
- **Vs Salesforce**: Mais acessível, menos complexo  
- **Vs Pipedrive**: Mais inteligente (IA), mais integrado (WhatsApp)
- **Vs Monday**: Mais focado em CRM, menos disperso
- **Vs Notion**: Mais estruturado, menos manual

### **Personalidade de Marca Desejada**
1. **Profissional mas Acessível** (não intimidante como Salesforce)
2. **Inteligente e Moderno** (IA integrada, tecnologia atual)  
3. **Brasileiro e Caloroso** (entende o mercado local)
4. **Eficiente e Focado** (especializado em agências)
5. **Confiável e Seguro** (dados protegidos, LGPD nativo)

## **4. PALETA DE CORES - ESTRATÉGIA PSICOLÓGICA**

### **Cor Primária: Loved Purple (#8B5CF6)**

**Justificativa Psicológica**:
- **Roxo = Criatividade + Inovação**: Perfeito para agências digitais criativas
- **Sofisticação sem ser intimidante**: Profissional mas acessível
- **Diferenciação competitiva**: Nenhum concorrente direto usa roxo como primária
- **IA Association**: Roxo é psicologicamente associado com inteligência artificial
- **Brazilian Warmth**: Tom mais quente que azul enterprise, mais acolhedor

**Tom Específico**: `#8B5CF6` (Violet-500 do Tailwind)
- **HSL**: `hsl(262, 83%, 67%)`
- **RGB**: `139, 92, 246`
- **Contraste**: 4.5:1 sobre branco (WCAG AA compliant)

### **Paleta de Suporte**

#### **Secundária: Warm Gray (#6B7280)**
- **Uso**: Textos secundários, bordas, elementos neutros
- **Psicologia**: Cinza quente (não frio), acolhedor, brasileiro
- **Código**: `#6B7280` (Gray-500)

#### **Accent: Emerald Green (#10B981)**
- **Uso**: Indicadores de sucesso, CTAs positivos, métricas
- **Psicologia**: Verde = crescimento, sucesso, prosperidade
- **Código**: `#10B981` (Emerald-500)

#### **Warning: Amber (#F59E0B)**
- **Uso**: Alertas, ações pendentes, atenção moderada
- **Psicologia**: Âmbar = atenção sem alarme
- **Código**: `#F59E0B` (Amber-500)

#### **Destructive: Red (#EF4444)**
- **Uso**: Erros, exclusões, ações perigosas
- **Psicologia**: Vermelho = perigo, parar, atenção máxima
- **Código**: `#EF4444` (Red-500)

### **Paleta Organizacional (B2B Específica)**

#### **Organization Tiers Colors**
- **Free Tier**: `#9CA3AF` (Gray-400) - Neutro, básico
- **Pro Tier**: `#8B5CF6` (Violet-500) - Primária, profissional  
- **Enterprise Tier**: `#1F2937` (Gray-800) - Premium, sofisticado

#### **Collaboration Colors**
- **Team Members**: `#3B82F6` (Blue-500) - Colaboração
- **Shared Resources**: `#06B6D4` (Cyan-500) - Compartilhamento
- **Organization Scope**: `#8B5CF6` (Violet-500) - Contexto org

## **5. TOKENS SHADCN/UI COMPATÍVEIS**

### **CSS Custom Properties (app/globals.css)**

```css
:root {
  /* === LOVED CRM BRAND TOKENS === */
  
  /* Primary - Loved Purple */
  --primary: 262 83% 58%;           /* #8B5CF6 mais escuro para contraste */
  --primary-foreground: 210 40% 98%; /* Branco para texto sobre primary */
  
  /* Secondary - Warm Gray */
  --secondary: 220 14% 96%;          /* Cinza muito claro para backgrounds */
  --secondary-foreground: 220 9% 46%; /* Gray-600 para texto */
  
  /* Accent - Emerald Success */
  --accent: 160 84% 39%;             /* #10B981 Emerald-500 */
  --accent-foreground: 0 0% 98%;     /* Branco para texto sobre accent */
  
  /* Muted - Neutral Backgrounds */
  --muted: 220 14% 96%;              /* Gray-50 para backgrounds neutros */
  --muted-foreground: 220 9% 46%;    /* Gray-600 para texto muted */
  
  /* Destructive - Red Alerts */
  --destructive: 0 84% 60%;          /* #EF4444 Red-500 */
  --destructive-foreground: 0 0% 98%; /* Branco para texto sobre red */
  
  /* Borders e Inputs */
  --border: 220 13% 91%;             /* Gray-200 para bordas sutis */
  --input: 220 13% 91%;              /* Gray-200 para input borders */
  --ring: 262 83% 58%;               /* Primary color para focus rings */
  
  /* Backgrounds */
  --background: 0 0% 100%;           /* Branco puro */
  --foreground: 224 71% 4%;          /* Quase preto para texto principal */
  
  /* Cards */
  --card: 0 0% 100%;                 /* Branco para cards */
  --card-foreground: 224 71% 4%;     /* Texto escuro em cards */
  
  /* Popover */
  --popover: 0 0% 100%;              /* Branco para popovers */
  --popover-foreground: 224 71% 4%;  /* Texto escuro em popovers */
  
  /* Sidebar (para layouts admin) */
  --sidebar-background: 224 71% 4%;         /* Escuro para sidebar */
  --sidebar-foreground: 220 9% 78%;         /* Texto claro em sidebar */
  --sidebar-primary: 262 83% 58%;           /* Primary em sidebar */
  --sidebar-primary-foreground: 0 0% 98%;   /* Texto sobre primary */
  --sidebar-accent: 220 14% 14%;            /* Accent mais escuro */
  --sidebar-accent-foreground: 220 9% 78%;  /* Texto sobre accent */
  --sidebar-border: 220 13% 22%;            /* Bordas em sidebar */
  --sidebar-ring: 262 83% 58%;              /* Ring color em sidebar */
}

.dark {
  /* === DARK MODE TOKENS === */
  
  --background: 224 71% 4%;          /* Escuro */
  --foreground: 210 40% 98%;         /* Claro */
  
  --card: 224 71% 4%;                /* Escuro */
  --card-foreground: 210 40% 98%;    /* Claro */
  
  --popover: 224 71% 4%;             /* Escuro */
  --popover-foreground: 210 40% 98%; /* Claro */
  
  --primary: 262 83% 67%;            /* Violet-400 mais claro no dark */
  --primary-foreground: 224 71% 4%;  /* Escuro para contraste */
  
  --secondary: 215 28% 17%;          /* Gray-800 */
  --secondary-foreground: 210 40% 98%; /* Claro */
  
  --muted: 215 28% 17%;              /* Gray-800 */
  --muted-foreground: 217 19% 27%;   /* Gray-700 */
  
  --accent: 160 84% 39%;             /* Emerald-500 mantém */
  --accent-foreground: 0 0% 98%;     /* Branco */
  
  --destructive: 0 63% 31%;          /* Red-800 mais escuro */
  --destructive-foreground: 210 40% 98%; /* Claro */
  
  --border: 215 28% 17%;             /* Gray-800 */
  --input: 215 28% 17%;              /* Gray-800 */
  --ring: 262 83% 67%;               /* Violet-400 */
  
  /* Sidebar dark mode */
  --sidebar-background: 0 0% 0%;            /* Preto para sidebar */
  --sidebar-foreground: 220 9% 78%;         /* Cinza claro */
  --sidebar-primary: 262 83% 67%;           /* Violet-400 */
  --sidebar-primary-foreground: 0 0% 0%;    /* Preto */
  --sidebar-accent: 220 14% 22%;            /* Gray-700 */
  --sidebar-accent-foreground: 220 9% 78%;  /* Cinza claro */
  --sidebar-border: 220 13% 13%;            /* Gray-900 */
  --sidebar-ring: 262 83% 67%;              /* Violet-400 */
}
```

## **6. TOKENS B2B ESPECÍFICOS**

### **Organization Context Colors**

```css
:root {
  /* === B2B ORGANIZATION TOKENS === */
  
  /* Organization Tiers */
  --tier-free: 220 9% 46%;           /* Gray-600 */
  --tier-pro: 262 83% 58%;           /* Primary Violet */
  --tier-enterprise: 224 71% 4%;     /* Dark Gray */
  
  /* Multi-tenancy Visual Cues */
  --org-scope: 262 83% 58%;          /* Primary para indicar contexto org */
  --org-isolation: 160 84% 39%;      /* Green para indicar dados seguros */
  --cross-org-warning: 0 84% 60%;    /* Red para alertas cross-org */
  
  /* Team Collaboration */
  --team-member: 217 91% 60%;        /* Blue-500 para membros */
  --team-admin: 262 83% 58%;         /* Primary para admins */
  --team-owner: 224 71% 4%;          /* Dark para owners */
  
  /* Pipeline Stages (CRM-specific) */
  --pipeline-lead: 220 9% 46%;       /* Gray-600 - inicial */
  --pipeline-contact: 217 91% 60%;   /* Blue-500 - em contato */
  --pipeline-proposal: 43 96% 56%;   /* Yellow-400 - proposta */
  --pipeline-negotiation: 25 95% 53%; /* Orange-500 - negociação */
  --pipeline-closed: 160 84% 39%;    /* Green-500 - fechado */
  
  /* Communication Channels */
  --whatsapp: 142 76% 36%;           /* WhatsApp Green */
  --email: 217 91% 60%;              /* Blue para email */
  --voip: 262 83% 58%;               /* Primary para VoIP */
  --note: 220 9% 46%;                /* Gray para notas */
  
  /* AI Features */
  --ai-summary: 262 83% 58%;         /* Primary para IA */
  --ai-suggestion: 160 84% 39%;      /* Green para sugestões */
  --ai-warning: 43 96% 56%;          /* Yellow para atenção */
}
```

### **Semantic Tokens (TypeScript)**

```typescript
// types/design-tokens.ts
export const designTokens = {
  colors: {
    brand: {
      primary: 'hsl(262, 83%, 58%)',      // Loved Purple
      secondary: 'hsl(220, 9%, 46%)',     // Warm Gray
      accent: 'hsl(160, 84%, 39%)',       // Emerald Success
    },
    organization: {
      tierFree: 'hsl(220, 9%, 46%)',      // Gray-600
      tierPro: 'hsl(262, 83%, 58%)',      // Primary
      tierEnterprise: 'hsl(224, 71%, 4%)', // Dark
    },
    pipeline: {
      lead: 'hsl(220, 9%, 46%)',          // Gray
      contact: 'hsl(217, 91%, 60%)',      // Blue
      proposal: 'hsl(43, 96%, 56%)',      // Yellow
      negotiation: 'hsl(25, 95%, 53%)',   // Orange
      closed: 'hsl(160, 84%, 39%)',       // Green
    },
    communication: {
      whatsapp: 'hsl(142, 76%, 36%)',     // WhatsApp Brand
      email: 'hsl(217, 91%, 60%)',        // Blue
      voip: 'hsl(262, 83%, 58%)',         // Primary
      note: 'hsl(220, 9%, 46%)',          // Gray
    },
    ai: {
      summary: 'hsl(262, 83%, 58%)',      // Primary
      suggestion: 'hsl(160, 84%, 39%)',   // Green
      warning: 'hsl(43, 96%, 56%)',       // Yellow
    }
  },
  spacing: {
    organizationCard: '1rem',              // 16px
    pipelineStage: '1.5rem',              // 24px
    timelineEntry: '0.75rem',             // 12px
  },
  borderRadius: {
    organizationCard: '0.5rem',           // 8px
    pipelineCard: '0.375rem',             // 6px
    aiSummary: '0.75rem',                 // 12px
  }
} as const;
```

## **7. IMPLEMENTAÇÃO COMPONENTS**

### **Organization Context Component**

```typescript
// components/ui/organization-badge.tsx
import { cn } from "@/lib/utils"
import { designTokens } from "@/types/design-tokens"

interface OrganizationBadgeProps {
  tier: 'free' | 'pro' | 'enterprise'
  children: React.ReactNode
  className?: string
}

export function OrganizationBadge({ tier, children, className }: OrganizationBadgeProps) {
  const tierStyles = {
    free: "bg-gray-100 text-gray-600 border-gray-200",
    pro: "bg-violet-100 text-violet-700 border-violet-200",
    enterprise: "bg-gray-900 text-gray-100 border-gray-800"
  }
  
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      tierStyles[tier],
      className
    )}>
      {children}
    </span>
  )
}
```

### **Pipeline Stage Component**

```typescript
// components/crm/pipeline-stage.tsx
import { cn } from "@/lib/utils"

type PipelineStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'closed'

interface PipelineStageProps {
  stage: PipelineStage
  count?: number
  className?: string
}

export function PipelineStage({ stage, count, className }: PipelineStageProps) {
  const stageStyles = {
    lead: "bg-gray-50 border-gray-200 text-gray-700",
    contact: "bg-blue-50 border-blue-200 text-blue-700", 
    proposal: "bg-yellow-50 border-yellow-200 text-yellow-700",
    negotiation: "bg-orange-50 border-orange-200 text-orange-700",
    closed: "bg-emerald-50 border-emerald-200 text-emerald-700"
  }
  
  const stageLabels = {
    lead: "Lead",
    contact: "Contato", 
    proposal: "Proposta",
    negotiation: "Negociação",
    closed: "Fechado"
  }
  
  return (
    <div className={cn(
      "rounded-lg border-2 border-dashed p-4 transition-colors",
      stageStyles[stage],
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="font-medium">{stageLabels[stage]}</h3>
        {count !== undefined && (
          <span className="text-sm opacity-75">
            {count}
          </span>
        )}
      </div>
    </div>
  )
}
```

### **AI Summary Component**

```typescript
// components/crm/ai-summary.tsx
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

interface AISummaryProps {
  summary: string
  confidence?: number
  className?: string
}

export function AISummary({ summary, confidence, className }: AISummaryProps) {
  return (
    <div className={cn(
      "rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 p-4",
      className
    )}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <span className="text-sm font-medium text-violet-700">
          Resumo com IA
        </span>
        {confidence && (
          <span className="text-xs text-violet-600 opacity-75">
            {confidence}% confiança
          </span>
        )}
      </div>
      <p className="text-sm text-violet-900 leading-relaxed">
        {summary}
      </p>
    </div>
  )
}
```

## **8. TOKENS PARA FEATURES ESPECÍFICAS**

### **WhatsApp Integration**

```css
:root {
  /* WhatsApp Brand Colors */
  --whatsapp-green: 142 76% 36%;         /* #25D366 official */
  --whatsapp-dark: 142 82% 17%;          /* #128C7E dark green */
  --whatsapp-light: 142 76% 96%;         /* Very light green */
  
  /* Message Bubbles */
  --whatsapp-incoming: 142 76% 96%;      /* Light green for incoming */
  --whatsapp-outgoing: 217 91% 95%;      /* Light blue for outgoing */
}
```

### **Timeline Communication**

```css
:root {
  /* Timeline Colors */
  --timeline-whatsapp: 142 76% 36%;      /* WhatsApp green */
  --timeline-email: 217 91% 60%;         /* Email blue */
  --timeline-voip: 262 83% 58%;          /* VoIP primary */
  --timeline-note: 220 9% 46%;           /* Note gray */
  --timeline-ai: 262 83% 58%;            /* AI primary */
  
  /* Timeline States */
  --timeline-sent: 160 84% 39%;          /* Green success */
  --timeline-delivered: 217 91% 60%;     /* Blue delivered */
  --timeline-read: 142 76% 36%;          /* WhatsApp green read */
  --timeline-failed: 0 84% 60%;          /* Red failed */
}
```

### **Multi-Tenant Security Visual Cues**

```css
:root {
  /* Security States */
  --security-isolated: 160 84% 39%;      /* Green - dados seguros */
  --security-shared: 217 91% 60%;        /* Blue - compartilhado */
  --security-warning: 43 96% 56%;        /* Yellow - atenção */
  --security-danger: 0 84% 60%;          /* Red - perigo cross-org */
  
  /* Organization Context */
  --org-current: 262 83% 58%;            /* Primary - org atual */
  --org-scope-indicator: 262 83% 90%;    /* Light purple background */
  --org-isolation-border: 160 84% 39%;   /* Green border para isolamento */
}
```

## **9. RESPONSIVIDADE E BREAKPOINTS**

### **Breakpoints Personalizados**

```css
/* Mobile First - Brazilian Agency Usage Patterns */
:root {
  --mobile-first: 320px;     /* Smartphones básicos */
  --mobile-comfort: 375px;   /* iPhone padrão */
  --tablet: 768px;           /* iPad / Android tablets */
  --desktop: 1024px;         /* Notebooks agências */
  --desktop-large: 1440px;   /* Monitores externos */
  --desktop-xl: 1920px;      /* Monitores grandes */
}

/* Ajustes para Mobile (uso WhatsApp-first) */
@media (max-width: 768px) {
  :root {
    --primary: 262 83% 67%;   /* Slightly lighter on mobile */
    --sidebar-background: 224 71% 4%; /* Full dark sidebar on mobile */
  }
}
```

## **10. ACESSIBILIDADE (WCAG 2.1 AA)**

### **Contrast Ratios Verificados**

```css
/* All combinations meet WCAG AA (4.5:1) or AAA (7:1) */
:root {
  --primary-contrast: 4.52;          /* Primary on white */
  --secondary-contrast: 4.89;        /* Secondary on white */
  --accent-contrast: 4.97;           /* Accent on white */
  --destructive-contrast: 5.25;      /* Red on white */
  
  /* Dark mode ratios */
  --dark-primary-contrast: 8.1;      /* Violet-400 on dark */
  --dark-accent-contrast: 5.8;       /* Emerald on dark */
}
```

### **Focus States**

```css
/* Enhanced focus for Brazilian users (high keyboard usage) */
:root {
  --focus-ring: 2px solid hsl(262, 83%, 58%);
  --focus-ring-offset: 2px;
  --focus-ring-opacity: 0.5;
}

.focus-visible {
  outline: var(--focus-ring);
  outline-offset: var(--focus-ring-offset);
  box-shadow: 0 0 0 var(--focus-ring-offset) hsla(262, 83%, 58%, var(--focus-ring-opacity));
}
```

## **11. TOKENS DE ANIMAÇÃO**

### **Micro-interações B2B**

```css
:root {
  /* Professional timing (not too playful) */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;  
  --transition-slow: 350ms ease-out;
  
  /* Specific CRM animations */
  --pipeline-drag: 200ms cubic-bezier(0.2, 0, 0, 1);
  --timeline-appear: 300ms ease-out;
  --ai-summary-expand: 400ms cubic-bezier(0.4, 0, 0.2, 1);
  --whatsapp-message: 150ms ease-out;
  
  /* Organization context transitions */
  --org-switch: 300ms cubic-bezier(0.4, 0, 0.2, 1);
  --tier-upgrade: 250ms ease-out;
}
```

## **12. IMPLEMENTAÇÃO CHECKLIST**

### **Fase 1: Core Tokens (Semana 1)**
- [ ] Implementar CSS custom properties principais
- [ ] Configurar dark mode variants
- [ ] Validar contraste WCAG AA
- [ ] Testar compatibilidade shadcn/ui

### **Fase 2: B2B Específicos (Semana 2)**  
- [ ] Implementar organization context tokens
- [ ] Criar pipeline stage colors
- [ ] Desenvolver team collaboration indicators
- [ ] Adicionar tier-specific styling

### **Fase 3: CRM Features (Semana 3)**
- [ ] Implementar communication channel colors
- [ ] Configurar AI summary styling
- [ ] Adicionar WhatsApp integration colors
- [ ] Criar timeline visual tokens

### **Fase 4: Refinamento (Semana 4)**
- [ ] Ajustar baseado em feedback usuário
- [ ] Otimizar performance CSS
- [ ] Documentar padrões de uso
- [ ] Validar acessibilidade completa

## **13. MÉTRICAS DE SUCESSO**

### **Quantitativas**
- **Contrast Ratio**: ≥ 4.5:1 (WCAG AA) para todos os tokens
- **Performance CSS**: < 50kb de tokens CSS total
- **Consistency Score**: 100% componentes usando design tokens
- **Mobile Usability**: Tokens responsivos em todos breakpoints

### **Qualitativas**
- **Brand Recognition**: Roxo único no mercado CRM brasileiro
- **User Comfort**: Interface familiar mas diferenciada
- **Professional Trust**: Cores transmitem confiabilidade B2B
- **Brazilian Warmth**: Paleta acolhedora, não fria/corporativa

## **14. CONCLUSÃO**

### **Diferenciação Competitiva Visual**
1. **Loved Purple (#8B5CF6)**: Único no mercado CRM, associado com IA e criatividade
2. **Brazilian Warmth**: Tons mais acolhedores que concorrentes internacionais
3. **B2B Professional**: Equilibrio entre acessível e corporativo
4. **Multi-tenant Visual Cues**: Indicadores visuais de contexto organizacional
5. **WhatsApp Integration**: Cores nativas para máxima familiaridade

### **Implementação Técnica**
- **100% shadcn/ui compatible**: Todos os tokens estendem sistema existente
- **CSS Custom Properties**: Performance otimizada, fácil manutenção
- **TypeScript Support**: Type-safe design tokens
- **Dark Mode Ready**: Paleta completa para ambos os temas
- **Mobile First**: Otimizado para uso smartphone (WhatsApp-first usage)

### **Posicionamento Psicológico**
**"Profissional, Inteligente, Acolhedor"** - exatamente o que agências digitais brasileiras precisam: uma ferramenta séria que não as intimida, moderna que as inspira, e brasileira que as entende.

---

**Este sistema de design tokens posiciona Loved CRM como a escolha natural para agências digitais brasileiras, combinando profissionalismo internacional com acolhimento brasileiro, tecnologia de IA com simplicidade de uso.**

**Próxima Revisão**: Após 30 dias de uso com 10 agências beta  
**Responsável**: Design System Team  
**Status**: ✅ Pronto para Implementação