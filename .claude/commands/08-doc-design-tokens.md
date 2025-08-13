---
description: 'Gera theme shadcn/ui completo customizado para produtos B2B baseado no setor empresarial'
argument-hint: 'setor (opcional) - após docs/project/02-prd.md'
allowed-tools: ['Read', 'Write', 'LS', 'Grep', 'WebFetch']
---

# 08-design-tokens-generator-b2b

**Shadcn/ui Theme Generator para Produtos B2B** - Especialista em gerar THEME COMPLETO shadcn/ui para **aplicações empresariais B2B** seguindo https://ui.shadcn.com/docs/theming. Analisa o setor empresarial e gera theme corporativo completo PRONTO PARA APLICAR com foco em **profissionalismo e confiabilidade empresarial**. **PRODUTO EXCLUSIVAMENTE B2B** - theme deve transmitir seriedade, organização e colaboração empresarial. **Substitui o theme padrão** por um theme customizado baseado no setor B2B.

**📋 LEITURA OBRIGATÓRIA ANTES DE QUALQUER THEME:**

- ✅ **DEVE**: Read CHANGELOG.md - ANALISAR histórico completo de implementações do projeto

**Entrada**:

- @docs/project/02-prd.md (setor e modelo de negócio)
- @docs/project/03-tech.md (modelo B2B/B2C)

**Saída:**

- **Arquivo**: `docs/project/08-design-tokens.md`
- **Formato**: Theme shadcn/ui completo customizado por setor
- **Conteúdo**: Tokens CSS, cores setoriais e configuração pronta para aplicação

## **🔒 REGRAS CRÍTICAS NÃO-NEGOCIÁVEIS**

### **Shadcn/ui Theme Compliance**

- ✅ **DEVE**: Gerar theme COMPLETO seguindo https://ui.shadcn.com/docs/theming
- ✅ **DEVE**: Incluir TODOS os tokens obrigatórios (background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring, radius)
- ✅ **DEVE**: Incluir versões light E dark mode completas
- ❌ **NUNCA**: Gerar apenas tokens "extras" - deve ser theme substituto

### **Sector-Based Colors**

- ✅ **OBRIGATÓRIO**: Pesquisar 3+ concorrentes do setor para cores
- ✅ **OBRIGATÓRIO**: Adaptar primary/accent ao setor específico
- ✅ **OBRIGATÓRIO**: Justificar cada cor com base competitiva

### **B2B/B2C Adaptation**

- ✅ **DEVE**: Adaptar paleta ao modelo detectado (B2B = profissional, B2C = amigável)
- ✅ **DEVE**: Preservar funcionalidade dos componentes shadcn/ui

## **🎯 PROCESSO SIMPLIFICADO**

### **Etapa 1: Análise do Setor (15min)**

1. **Ler PRD** → setor específico + modelo B2B/B2C
2. **Pesquisar concorrentes** → 3-5 líderes do setor
3. **Extrair cores principais** → converter para HSL

### **Etapa 2: Gerar Theme Completo (15min)**

1. **Definir primary** → cor principal do setor
2. **Calcular paleta completa** → todos os tokens shadcn/ui obrigatórios
3. **Adaptar ao modelo** → B2B (profissional) vs B2C (amigável)
4. **Gerar light + dark** → versões completas do theme

## **📋 TEMPLATE DE SAÍDA - THEME COMPLETO SHADCN/UI**

````markdown
# Theme Shadcn/ui Completo - [Nome do Produto]

## BENCHMARK SETORIAL

### Concorrentes Analisados

1. **[Nome]** - [URL] - Primary: `#[HEX]` → `hsl([H], [S]%, [L]%)` - [Emoção]
2. **[Nome]** - [URL] - Primary: `#[HEX]` → `hsl([H], [S]%, [L]%)` - [Emoção]
3. **[Nome]** - [URL] - Primary: `#[HEX]` → `hsl([H], [S]%, [L]%)` - [Emoção]

### Estratégia Definida

- **Primary escolhida**: `hsl([H], [S]%, [L]%)` - [Justificativa setorial]
- **Modelo**: [B2B/B2C] - [Adaptação da paleta]
- **Diferenciação**: [Como nos destacamos]

## THEME COMPLETO LIGHT MODE

```css
/* ✅ SUBSTITUIR COMPLETAMENTE o :root em app/globals.css */
@layer base {
  :root {
    /* Base Colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    /* Card Colors */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    /* Popover Colors */
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Primary Colors - SETORIAL */
    --primary: [H] [S]% [L]%;
    --primary-foreground: 210 40% 98%;

    /* Secondary Colors */
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;

    /* Muted Colors */
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* Accent Colors - SETORIAL */
    --accent: [H] [S]% [L]%;
    --accent-foreground: 222.2 84% 4.9%;

    /* Destructive Colors */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    /* Border & Input Colors */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;

    /* Focus Ring - SETORIAL */
    --ring: [H] [S]% [L]%;

    /* Border Radius */
    --radius: 0.5rem;
  }
}
```
````

## THEME COMPLETO DARK MODE

```css
/* ✅ SUBSTITUIR COMPLETAMENTE o .dark em app/globals.css */
@layer base {
  .dark {
    /* Base Colors */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    /* Card Colors */
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    /* Popover Colors */
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    /* Primary Colors - SETORIAL DARK */
    --primary: [H] [S]% [L]%;
    --primary-foreground: 222.2 84% 4.9%;

    /* Secondary Colors */
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    /* Muted Colors */
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    /* Accent Colors - SETORIAL DARK */
    --accent: [H] [S]% [L]%;
    --accent-foreground: 210 40% 98%;

    /* Destructive Colors */
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    /* Border & Input Colors */
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;

    /* Focus Ring - SETORIAL DARK */
    --ring: [H] [S]% [L]%;
  }
}
```

## TAILWIND CONFIG COMPLETO

```javascript
/* ✅ SUBSTITUIR COMPLETAMENTE colors em tailwind.config.js */
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
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
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
};
```

## IMPLEMENTAÇÃO

### Passos

1. **Copiar CSS Light** → Substituir `:root` em `app/globals.css`
2. **Copiar CSS Dark** → Substituir `.dark` em `app/globals.css`
3. **Copiar Tailwind** → Substituir `colors` em `tailwind.config.js`
4. **Reiniciar dev** → `npm run dev`
5. **Testar componentes** → Verificar se todos funcionam

### Validação

- [ ] Theme light aplicado
- [ ] Theme dark funcionando
- [ ] Todos componentes shadcn/ui funcionais
- [ ] Cores setoriais visíveis
- [ ] Toggle dark/light funcional

## **✅ CHECKLIST SIMPLIFICADO**

- [ ] **Theme completo** gerado seguindo https://ui.shadcn.com/docs/theming
- [ ] **Benchmark setorial** realizado (3+ concorrentes)
- [ ] **Todos os tokens** obrigatórios incluídos
- [ ] **Light + Dark mode** completos
- [ ] **Cores setoriais** justificadas
- [ ] **Modelo B2B/B2C** aplicado na paleta

## **🚨 RED FLAGS**

- ❌ Theme incompleto (faltam tokens obrigatórios)
- ❌ Sem benchmark competitivo
- ❌ Cores sem justificativa setorial
- ❌ Dark mode não funcional

---

**EXECUTAR PROCESSO E GERAR @docs/project/08-design-tokens.md**
