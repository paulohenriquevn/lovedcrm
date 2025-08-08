# Design Tokens Setoriais - Loved CRM

## 1. Pesquisa Setorial

### Concorrentes Analisados:

1. **HubSpot** - https://www.hubspot.com - Cor: `#FF7A59` → `hsl(12, 100%, 67%)` - **ENERGIA & CRIATIVIDADE**
   - Uso estratégico do laranja coral para transmitir energia e inovação
   - Combinação com cinza carvão para profissionalismo
   - Sistema Canvas Design focado em clareza e hierarquia visual

2. **Pipedrive** - https://www.pipedrive.com - Cor: `#4A90E2` → `hsl(213, 74%, 59%)` - **CONFIANÇA & EFICIÊNCIA**
   - Azul institucional transmite confiabilidade e organização
   - Interface Kanban com foco na jornada do cliente
   - Sistema visual otimizado para vendedores

3. **RD Station** - https://www.rdstation.com - Cor: `#2C5AA0` → `hsl(217, 59%, 40%)` - **AUTORIDADE & CRESCIMENTO**
   - Azul escuro representa autoridade no marketing digital brasileiro
   - Líder em SaaS para PMEs com +50.000 clientes
   - Sistema robusto de automação com cores que transmitem solidez

### Estratégia Setorial:

- **Cor primária escolhida**: `hsl(262, 83%, 58%)` - **DIFERENCIAÇÃO VIOLETA**
  - Combina a confiabilidade do azul com a energia do vermelho
  - Destaque único no mercado saturado de azuis/laranjas
  - Transmite inovação tecnológica e liderança no setor

- **Diferenciação**: Posicionamento premium entre concorrentes através do roxo/violeta
- **Modelo**: B2B com tokens `organization` para colaboração empresarial

## 2. CSS PRONTO PARA APLICAR

### Adicionar ao app/globals.css:

```css
/* ✅ COPIAR ESTE BLOCO PARA app/globals.css na seção :root */
@layer base {
  :root {
    /* Tokens shadcn/ui existentes - PRESERVADOS */
    --background: 0 0% 100%;
    --foreground: 224 71% 4%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    /* ... outros tokens existentes mantidos ... */

    /* 🎨 NOVOS TOKENS SETORIAIS */
    --sector-primary: 262 83% 58%; /* Loved CRM Violet - diferenciação */
    --sector-primary-foreground: 210 40% 98%; /* Branco para contraste */
    --sector-secondary: 217 59% 40%; /* RD Station Blue - autoridade */
    --sector-accent: 12 100% 67%; /* HubSpot Orange - energia */

    /* 🏢 TOKENS MODELO B2B */
    --organization: 262 83% 58%; /* Primary violet para contexto organizacional */
    --collaborative: 217 91% 60%; /* Azul para features colaborativas */
    --sector-cta: 12 100% 67%; /* Orange forte para CTAs importantes */
    --sector-trust: 160 84% 39%; /* Verde para indicar confiança/segurança */

    /* 🔄 TOKENS COMPETITIVOS */
    --competitor-hubspot: 12 100% 67%; /* HubSpot Orange referência */
    --competitor-pipedrive: 213 74% 59%; /* Pipedrive Blue referência */
    --competitor-rd: 217 59% 40%; /* RD Station Blue referência */

    /* 🎯 TOKENS SETORIAIS ESPECÍFICOS */
    --agency-premium: 262 83% 65%; /* Violeta claro para tier premium */
    --agency-growth: 160 84% 45%; /* Verde crescimento */
    --agency-conversion: 25 95% 55%; /* Laranja conversão */
    --agency-retention: 217 91% 60%; /* Azul retenção */
  }

  .dark {
    /* Tokens shadcn/ui dark existentes - PRESERVADOS */
    --background: 224 71% 4%;
    --foreground: 210 40% 98%;
    --primary: 262 83% 67%;
    /* ... outros tokens dark existentes mantidos ... */

    /* 🌙 NOVOS TOKENS SETORIAIS - DARK MODE */
    --sector-primary: 262 83% 67%; /* Violeta mais claro no dark */
    --sector-primary-foreground: 224 71% 4%; /* Escuro para contraste */
    --sector-secondary: 217 59% 50%; /* Azul mais claro no dark */
    --sector-accent: 12 100% 72%; /* Orange mais claro no dark */

    --organization: 262 83% 67%; /* Violeta claro para org context */
    --collaborative: 217 91% 70%; /* Azul claro para colaboração */
    --sector-cta: 12 100% 72%; /* Orange claro para CTAs */
    --sector-trust: 160 84% 49%; /* Verde claro para confiança */

    --competitor-hubspot: 12 100% 72%; /* HubSpot Orange dark mode */
    --competitor-pipedrive: 213 74% 69%; /* Pipedrive Blue dark mode */
    --competitor-rd: 217 59% 50%; /* RD Station Blue dark mode */

    --agency-premium: 262 83% 72%; /* Violeta premium dark */
    --agency-growth: 160 84% 52%; /* Verde growth dark */
    --agency-conversion: 25 95% 62%; /* Laranja conversion dark */
    --agency-retention: 217 91% 70%; /* Azul retention dark */
  }
}
```

## 3. TAILWIND CONFIG PRONTO PARA APLICAR

### Adicionar ao tailwind.config.js:

```javascript
// ✅ COPIAR ESTE BLOCO PARA tailwind.config.js em theme.extend.colors

colors: {
  // Cores shadcn/ui existentes - PRESERVADAS
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  // ... outras cores existentes mantidas ...

  // 🎨 NOVAS CORES SETORIAIS
  'sector-primary': {
    DEFAULT: 'hsl(var(--sector-primary))',
    foreground: 'hsl(var(--sector-primary-foreground))',
  },
  'sector-secondary': 'hsl(var(--sector-secondary))',
  'sector-accent': 'hsl(var(--sector-accent))',

  // 🏢 CORES MODELO B2B
  'organization': 'hsl(var(--organization))',
  'collaborative': 'hsl(var(--collaborative))',
  'sector-cta': 'hsl(var(--sector-cta))',
  'sector-trust': 'hsl(var(--sector-trust))',

  // 🔄 CORES COMPETITIVAS (para análises)
  'competitor': {
    hubspot: 'hsl(var(--competitor-hubspot))',
    pipedrive: 'hsl(var(--competitor-pipedrive))',
    rd: 'hsl(var(--competitor-rd))',
  },

  // 🎯 CORES AGÊNCIA DIGITAL
  'agency': {
    premium: 'hsl(var(--agency-premium))',
    growth: 'hsl(var(--agency-growth))',
    conversion: 'hsl(var(--agency-conversion))',
    retention: 'hsl(var(--agency-retention))',
  }
}
```

## 4. CLASSES TAILWIND PRONTAS

### Uso imediato após aplicar os tokens:

```html
<!-- Botão CTA setorial diferenciado -->
<button
  className="bg-sector-cta text-white hover:bg-sector-cta/90 font-semibold"
>
  Experimente o Loved CRM Grátis
</button>

<!-- Card com tema organizacional B2B -->
<Card className="border-organization/20 bg-organization/5">
  <CardContent className="text-organization">
    Dashboard da sua Organização
  </CardContent>
</Card>

<!-- Badge de diferenciação competitiva -->
<Badge className="bg-sector-primary text-white">
  Única solução violeta do mercado
</Badge>

<!-- Indicador de crescimento para agências -->
<div className="flex items-center gap-2">
  <div className="w-3 h-3 rounded-full bg-agency-growth"></div>
  <span className="text-agency-growth font-medium">+300% Conversão</span>
</div>

<!-- Pipeline com cores setoriais -->
<div className="bg-collaborative/10 border-l-4 border-collaborative p-4">
  <h3 className="text-collaborative font-semibold">Pipeline Colaborativo</h3>
  <p className="text-collaborative/80">Para equipes de vendas</p>
</div>

<!-- Trust indicator único no setor -->
<div className="bg-sector-trust/10 text-sector-trust p-3 rounded">
  <CheckIcon className="w-4 h-4 inline mr-2" />
  Isolamento Multi-Tenant Certificado
</div>
```

## 5. IMPLEMENTAÇÃO IMEDIATA

### Passos para aplicar:

1. **Copiar CSS**: Adicionar tokens CSS ao `app/globals.css` (preservando existentes)
2. **Atualizar Tailwind**: Adicionar cores ao `tailwind.config.js` (estendendo existentes)
3. **Reiniciar dev server**: `npm run dev` para aplicar mudanças
4. **Usar classes**: Aplicar `bg-sector-primary`, `text-organization` etc.
5. **Testar dark mode**: Verificar se tokens dark funcionam corretamente

### Validação:

- [ ] Tokens CSS aplicados em app/globals.css
- [ ] Tailwind config atualizado sem quebrar existentes
- [ ] Classes funcionando (`bg-sector-primary` etc.)
- [ ] Dark mode funcionando com tokens claros
- [ ] Compatibilidade shadcn/ui 100% mantida

## 6. ESTRATÉGIA DE DIFERENCIAÇÃO VISUAL

### Posicionamento Competitivo:

**Loved CRM vs Concorrentes:**

- **HubSpot**: Orange energético → **Loved**: Violeta inovador
- **Pipedrive**: Azul confiável → **Loved**: Violeta + Azul (autoridade + inovação)
- **RD Station**: Azul institucional → **Loved**: Sistema híbrido diferenciado

### Benefícios da Estratégia Violeta:

1. **Diferenciação Visual**: Único CRM roxo/violeta no mercado brasileiro
2. **Psicologia da Cor**: Combina confiança (azul) + energia (vermelho) = inovação
3. **Posicionamento Premium**: Violeta tradicionalmente associado ao luxury/premium
4. **Memorabilidade**: Destaque visual imediato em comparativos competitivos

### Aplicação Setorial:

- **Organizações**: Contexto empresarial com `organization` tokens
- **Agências Digitais**: Cores específicas para `agency-growth`, `agency-conversion`
- **B2B**: Tokens `collaborative` para features de equipe
- **Confiança**: `sector-trust` verde para multi-tenancy e segurança

## 7. MÉTRICAS DE SUCESSO

### KPIs Visuais:

- **Diferenciação**: 100% único no setor (violeta vs azul/laranja)
- **Reconhecimento**: Identidade visual memorável
- **Conversão**: CTAs laranjas com alta performance (baseado em HubSpot)
- **Confiança**: Verde para elementos de segurança/isolamento

### Teste A/B Sugerido:

- Landing Page com tokens violetas vs azuis tradicionais
- CTAs laranjas vs CTAs violetas para conversão
- Badges de confiança verdes vs azuis convencionais

---

**🎯 DESIGN TOKENS EXECUTÁVEIS COMPLETOS**

Este documento fornece tokens setoriais prontos para diferenciação competitiva no mercado brasileiro de CRM para agências digitais, mantendo 100% de compatibilidade com o sistema shadcn/ui existente e oferecendo estratégia visual única através do posicionamento violeta premium.
