# 09-doc-admin-pages

**Admin Dashboard Structure Generator** - Especialista em gerar estrutura hierárquica completa para TODAS AS TELAS DO ADMIN. Mapeia funcionalidades existentes + novas do PRD e cria estrutura organizacional navegável para área administrativa. Analisa codebase atual PRIMEIRO.

**📋 LEITURA OBRIGATÓRIA ANTES DE QUALQUER ADMIN STRUCTURE:**

- ✅ **DEVE**: Read CHANGELOG.md - ANALISAR histórico completo de implementações do projeto

**Entrada**:

- @docs/project/02-prd.md (todas funcionalidades)
- @docs/project/03-tech.md (modelo B2B/B2C)
- @docs/project/04-journeys.md (fluxos de usuário)
- Codebase atual (telas existentes)

**Saída**: @docs/project/09-admin-pages.md

## 🧠 **PENSAR ANTES DE AGIR - REGRA UNIVERSAL**

### **🚨 PAUSA OBRIGATÓRIA ANTES DE QUALQUER AÇÃO**

**PROCESSO OBRIGATÓRIO DE REFLEXÃO (2-3 minutos)**:

#### **🎯 COMPREENDER O PEDIDO (30s)**

- ❓ **Pergunta**: "O que exatamente o usuário está pedindo?"
- 📝 **Resposta**: [Mapear TODAS as telas administrativas existentes + novas do PRD]
- ✅ **Validação**: "Tenho 95% de certeza sobre o que preciso fazer?"

#### **🔍 ANALISAR PRÉ-REQUISITOS (60s)**

- 📋 **Pergunta**: "Que informações preciso coletar ANTES de agir?"
- 🔎 **Resposta**: [Telas existentes no codebase, funcionalidades do PRD, jornadas de usuário]
- ⚠️ **Validação**: "Posso prosseguir com o que tenho ou preciso de mais informações?"

#### **⚙️ PLANEJAR ABORDAGEM (60s)**

- 🛣️ **Pergunta**: "Qual é o melhor caminho para resolver isso?"
- 📈 **Resposta**: [Analisar codebase atual -> mapear PRD -> organizar hierarquia admin]
- 🎯 **Validação**: "Este plano leva ao resultado desejado?"

#### **🚨 VALIDAR PRINCÍPIOS (30s)**

- 🔴 **KISS**: Esta abordagem é a mais simples possível?
- 🔴 **YAGNI**: Estou implementando apenas o necessário AGORA?
- 🔴 **DRY**: Estou reutilizando o que já existe?
- 🔴 **95% CERTEZA**: Tenho confiança suficiente para prosseguir?

**❌ SE QUALQUER VALIDAÇÃO FALHAR**: PARAR e pedir esclarecimentos ao usuário
**✅ SE TODAS VALIDAÇÕES PASSAREM**: Prosseguir com execução confiante

### **📝 TEMPLATE DE REFLEXÃO OBRIGATÓRIA**

```
🧠 PENSANDO ANTES DE AGIR...

✅ COMPREENSÃO: [Estrutura completa admin dashboard com todas as telas]
✅ PRÉ-REQUISITOS: [PRD, codebase atual, jornadas, modelo B2B/B2C]
✅ PLANO: [Analisar -> mapear -> estruturar -> validar]
✅ VALIDAÇÃO: KISS ✓ YAGNI ✓ DRY ✓ 95% CERTEZA ✓

🚀 INICIANDO EXECUÇÃO COM CONFIANÇA...
```

## **🔒 REGRAS CRÍTICAS NÃO-NEGOCIÁVEIS**

### **95% Confidence Rule**

- ✅ **DEVE**: Ter 95%+ certeza sobre cada tela administrativa necessária
- ✅ **DEVE**: Basear em análise completa do codebase atual
- ❌ **NUNCA**: Criar estrutura admin sem mapear funcionalidades existentes

### **Chain of Preservation - ABSOLUTA**

- ✅ **DEVE**: Preservar 100% das funcionalidades existentes mapeadas
- ✅ **DEVE**: Incluir todas funcionalidades novas do PRD
- ✅ **DEVE**: Manter navegação e UX patterns existentes
- ❌ **NUNCA**: Alterar estrutura administrativa funcional
- ❌ **NUNCA**: Remover telas ou funcionalidades existentes

### **Multi-Tenant Admin Standards**

- ✅ **OBRIGATÓRIO**: Todas telas devem suportar organization_id isolation
- ✅ **OBRIGATÓRIO**: Permissions e roles adequados por seção
- ✅ **OBRIGATÓRIO**: Componentes shadcn/ui consistentes especificados

## **🚨 ANÁLISE OBRIGATÓRIA DO CODEBASE ANTES DE GERAR**

### **ETAPA 0: Mapeamento do Admin Atual (OBRIGATÓRIO)**

**ANTES** de gerar qualquer estrutura, DEVE analisar o codebase atual:

1. **Glob app/\\[locale\\]/admin/\\*\\*/\\*.tsx** - Todas as páginas admin existentes
2. **Glob components/admin/\\*.tsx** - Componentes administrativos
3. **Grep "admin\\|dashboard\\|settings"** - Funcionalidades administrativas
4. **Glob components/crm/\\*.tsx** - Componentes CRM existentes
5. **Grep "organization\\|permissions\\|role"** - Sistema de permissões

### **ETAPA 1: Identificação de Padrões (OBRIGATÓRIO)**

6. **Grep "sidebar\\|navigation\\|breadcrumb"** - Padrões de navegação existentes
7. **Grep "Table\\|Form\\|Modal\\|Card"** - Componentes UI utilizados
8. **Glob hooks/use-\\*admin\\*.ts** - Hooks administrativos
9. **Grep "toast\\|notification\\|alert"** - Padrões de feedback
10. **Glob services/\\*admin\\*.ts** - Services administrativos

### **✅ NUNCA FAZER:**

- Assumir estrutura admin sem verificar codebase ❌
- Inventar navegação não existente ❌
- Ignorar padrões de permissões atuais ❌
- Criar nova arquitetura sem analisar existente ❌

## **🎯 PROCESSO SIMPLIFICADO E EFICIENTE**

### **Etapa 1: Mapeamento Completo (20min)**

1. **Analisar codebase admin atual**:
   - Páginas existentes em app/[locale]/admin/
   - Componentes em components/admin/
   - Navegação e layouts atuais
   - Sistema de permissões implementado

2. **Mapear funcionalidades do PRD**:
   - Quais precisam de interface administrativa?
   - Como se integram com sistema atual?
   - Que novas telas são necessárias?

### **Etapa 2: Organização Hierárquica (20min)**

1. **Estruturar navegação principal**:
   - Dashboard / Overview
   - Módulos funcionais (CRM, Integrations, etc)
   - Settings e configurações
   - User management

2. **Mapear sub-seções**:
   - Cada módulo com suas telas
   - Fluxos entre telas
   - Permissions necessárias por seção

### **Etapa 3: Especificação Técnica (20min)**

1. **Definir componentes**:
   - Layout patterns (sidebar, header, breadcrumbs)
   - Table patterns para listagens
   - Form patterns para configurações
   - Modal patterns para ações

2. **Mapear integrações**:
   - Como telas se conectam
   - Fluxo de dados entre seções
   - Estados compartilhados

## **📋 TEMPLATE DE SAÍDA - ESTRUTURA HIERÁRQUICA ADMIN**

```markdown
# Admin Dashboard Structure - [Nome do Produto]

## PRESERVAÇÃO DO SISTEMA ATUAL

### Admin Existente Mapeado
[LISTAR TODAS as páginas/componentes existentes encontrados no codebase]
- **Páginas**: [app/[locale]/admin/ files encontrados]
- **Componentes**: [components/admin/ files encontrados]  
- **Navegação**: [Padrões de navegação identificados]
- **Permissions**: [Sistema de roles/permissions atual]

### Funcionalidades PRD para Admin (02-prd.md)
[LISTAR TODAS que precisam de interface administrativa]
1. [Funcionalidade 1] → [Que telas admin precisa]
2. [Funcionalidade 2] → [Que telas admin precisa]
3. [Funcionalidade N] → [Que telas admin precisa]

### Modelo Multi-Tenant (03-tech.md)
- **Tipo**: [B2B ou B2C]
- **Isolation**: organization_id filtering em todas as telas
- **Permissions**: [Como roles funcionam no modelo atual]

## ARQUITETURA DE NAVEGAÇÃO

### Layout Principal
- **Sidebar**: [Estrutura de navegação principal]
- **Header**: [User menu, notifications, org switcher]
- **Breadcrumbs**: [Padrão de navegação contextual]
- **Quick Actions**: [Ações principais por seção]

### Responsive Behavior
- **Desktop**: [Sidebar full, layout wide]
- **Tablet**: [Sidebar collapsible]
- **Mobile**: [Bottom navigation ou drawer]

# DASHBOARD
## Overview
### Metrics Cards
- **Leads Summary**: [Leads por stage, conversion rates]
- **Activity Summary**: [Messages, calls, tasks hoje]
- **Team Performance**: [Por membro, por período]
- **Revenue Summary**: [Vendas fechadas, pipeline value]

### Quick Stats
- **Recent Activity**: [Timeline últimas ações]
- **Pending Tasks**: [Tasks em aberto do usuário]
- **Notifications**: [Alerts do sistema]

### Actions
- **Primary**: [Nova lead, novo contato]
- **Secondary**: [Relatórios, exportar dados]

# CRM
## Leads Management
### Lead List
- **Table**: [Grid com filtros, search, pagination]
- **Filters**: [Por stage, assigned_to, date_range, source]
- **Actions**: [Bulk actions, individual actions]
- **Columns**: [Customizable columns, sort options]

### Lead Details
- **Information**: [Contact info, company, source]
- **Timeline**: [All interactions, notes, tasks]
- **Actions**: [Move stage, assign, add note]

## Pipeline Kanban
### Board View
- **Stages**: [5 stages fixos do sistema]
- **Drag & Drop**: [Move leads entre stages]
- **Card Info**: [Essential info per lead]
- **Filters**: [Global filters aplicados]

### Stage Management
- **Stage Rules**: [Automation rules per stage]
- **Required Fields**: [Campos obrigatórios por stage]
- **Notifications**: [Alerts e workflows]

## Communication Hub
### Messages Center
- **WhatsApp**: [Conversations, auto-responses]
- **Email**: [Templates, sequences]
- **Calls**: [Log, recordings if available]

### Templates
- **Message Templates**: [WhatsApp, email templates]
- **Sequences**: [Follow-up sequences]
- **Automation**: [Triggers e conditions]

# INTEGRATIONS
## WhatsApp Business
### Configuration
- **Account Setup**: [Phone verification, API setup]
- **Webhook Config**: [Callback URLs, tokens]
- **Templates**: [Approved message templates]

### Management
- **Conversations**: [Active chats, history]
- **Auto-Response**: [Rules, triggers]
- **Analytics**: [Message metrics, response times]

## Calendar Integration
### Google Calendar
- **OAuth Setup**: [Account connection, permissions]
- **Sync Settings**: [Bidirectional sync options]
- **Meeting Templates**: [Auto-scheduling rules]

### Scheduling
- **Availability**: [Available slots, buffers]
- **Meeting Types**: [Demo, consultation, follow-up]
- **Booking Pages**: [Public scheduling pages]

## AI Conversational
### Configuration
- **Provider Setup**: [OpenAI, Claude API keys]
- **Training Data**: [Company-specific knowledge]
- **Response Rules**: [Tone, length, boundaries]

### Management
- **Active Chats**: [AI-assisted conversations]
- **Learning**: [Feedback loop, improvements]
- **Analytics**: [AI usage, effectiveness metrics]

# TEAM & SETTINGS
## Organization Settings
### Company Profile
- **Basic Info**: [Name, logo, industry, address]
- **Branding**: [Colors, themes, custom domains]
- **Business Rules**: [Working hours, holidays]

### Preferences
- **Notifications**: [Email, in-app, webhooks]
- **Defaults**: [Assignment rules, stages]
- **Integrations**: [Connected services status]

## User Management
### Team Members
- **User List**: [All org members, roles, status]
- **Invite Users**: [Email invitations, role assignment]
- **Permissions**: [Role-based access control]

### Roles & Permissions
- **Default Roles**: [Admin, Manager, Agent, Viewer]
- **Custom Permissions**: [Granular access control]
- **Audit Log**: [User actions, changes history]

## Data Management
### Import/Export
- **Leads Import**: [CSV upload, mapping fields]
- **Data Export**: [Backup, compliance exports]
- **Bulk Operations**: [Mass updates, deletions]

### Backup & Security
- **Data Backup**: [Scheduled backups, restore]
- **Security Settings**: [2FA, session management]
- **Compliance**: [LGPD, data retention policies]

# BILLING & REPORTS
## Subscription Management
### Plan Details
- **Current Plan**: [Features, limits, usage]
- **Billing History**: [Invoices, payment methods]
- **Upgrade/Downgrade**: [Plan comparison, changes]

### Usage Analytics
- **Feature Usage**: [Leads, messages, storage]
- **Team Usage**: [Per user metrics]
- **Limits Monitoring**: [Approaching limits alerts]

## Analytics Dashboard
### Performance Metrics
- **Conversion Rates**: [Stage progression, win rates]
- **Response Times**: [First response, resolution]
- **Team Performance**: [Individual and team stats]

### Custom Reports
- **Report Builder**: [Drag & drop report creation]
- **Scheduled Reports**: [Auto-generated, email delivery]
- **Export Options**: [PDF, Excel, CSV formats]

### Revenue Analytics
- **Sales Funnel**: [Revenue per stage, forecasting]
- **Deal Analysis**: [Won/lost reasons, trends]
- **ROI Tracking**: [Campaign effectiveness, lead sources]

# LAYOUT PATTERNS

## Common Components
### Tables
- **DataTable**: [shadcn/ui table with sorting, filtering, pagination]
- **Actions Column**: [View, edit, delete dropdown]
- **Bulk Selection**: [Checkbox column, bulk actions bar]

### Forms
- **Settings Forms**: [Multi-step forms, validation]
- **Quick Forms**: [Modal forms for fast actions]
- **Auto-save**: [Draft states, unsaved changes warnings]

### Modals & Dialogs
- **Confirmation**: [Delete, irreversible actions]
- **Form Modals**: [Quick create, edit operations]
- **Detail Views**: [Expandable details, side panels]

## Navigation Patterns
### Breadcrumbs
- **Path Structure**: [Dashboard > CRM > Leads > Lead Name]
- **Quick Navigation**: [Clickable path segments]
- **Context Actions**: [Actions relevant to current page]

### Sidebar Structure
```
📊 Dashboard
📋 CRM
  ├── Leads
  ├── Pipeline
  └── Communication
🔌 Integrations
  ├── WhatsApp
  ├── Calendar  
  └── AI Assistant
👥 Team
  ├── Members
  ├── Roles
  └── Permissions
⚙️ Settings
  ├── Organization
  ├── Preferences
  └── Data Management
💳 Billing
  ├── Subscription
  └── Analytics
```

## State Management
### Loading States
- **Skeleton Loading**: [Table rows, cards, forms]
- **Progressive Loading**: [Critical content first]
- **Error States**: [Retry actions, fallback content]

### Empty States
- **No Data**: [Illustrations, call-to-action]
- **Filtered Results**: [Clear filters option]
- **Onboarding**: [First-time user guidance]
```

## **✅ CHECKLIST SIMPLIFICADO**

- [ ] **Codebase mapeado** - Todas telas existentes identificadas
- [ ] **PRD funcionalidades** incluídas - Admin interfaces necessárias
- [ ] **Navegação consistente** - Padrões existentes preservados
- [ ] **Multi-tenancy** - organization_id isolation em todas telas
- [ ] **Permissions mapeadas** - Roles e access control especificados
- [ ] **Componentes especificados** - shadcn/ui components identificados
- [ ] **Layout patterns** - Consistent UI patterns documentados
- [ ] **Mobile responsive** - Responsive behavior especificado

## **🚨 RED FLAGS**

- ❌ Tela existente não mapeada
- ❌ Funcionalidade PRD sem interface admin
- ❌ Navegação inconsistente com sistema atual
- ❌ Permissions não especificadas
- ❌ Multi-tenancy não implementada
- ❌ Componentes inexistentes no codebase

---

**EXECUTAR PROCESSO E GERAR @docs/project/09-admin-pages.md**