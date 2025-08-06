# 10-user-journeys.md - Loved CRM

## **MODELO + SETOR DETECTADO**

**Modelo confirmado**: B2B conforme 02-prd.md
**Setor identificado**: Agências digitais brasileiras (5-20 colaboradores) conforme 02-prd.md
**Funcionalidades mapeadas**: Pipeline Kanban de Leads, Timeline de Comunicação Integrada, Resumos IA de Conversas do PRD
**Endpoints utilizados**: /api/v1/crm/leads, /api/v1/crm/communications, /api/v1/crm/ai-summaries do 05-apis.md  
**Fluxo de conversão**: "Criar Organização Grátis" → Registro → Ativação baseado em 08-landing-page.md

## 🔍 **ANÁLISE COMPORTAMENTAL SETORIAL**

### **Setor: Agências Digitais Brasileiras B2B**

**Padrões comportamentais identificados**:

- **Preferência de registro**: SIMPLES - Agências valorizam rapidez e praticidade, evitam burocracias excessivas
- **Onboarding esperado**: PROGRESSIVO - Preferem descobrir recursos conforme necessidade, não querem sobrecarga inicial
- **Primeira ação típica**: Importar/criar primeiro lead ou projeto - demonstrar valor imediato com dados reais
- **Tempo para decisão**: 7-14 dias (ciclo enxuto) - Times pequenos decidem rapidamente se há ganho operacional claro
- **Principais motivos de abandono**: ["Dificuldade de adaptação à rotina", "Excesso de complexidade", "Falta de integração com stack existente", "Ausência de resultados perceptíveis em curto prazo"]
- **Fatores de retenção**: ["Facilidade de uso contínuo", "Integração fluida com outras ferramentas", "Personalização à cultura da agência", "Suporte técnico ágil"]

**Adaptações aplicadas**:

- **Tom de comunicação**: CASUAL-PROFISSIONAL - Brasileiro, acolhedor, mas competente e direto
- **Complexidade interface**: PROGRESSIVA - Começar simples, revelar funcionalidades avançadas conforme uso
- **Urgência temporal**: MODERADA - Agências têm deadline de clientes, mas também precisam avaliar bem as ferramentas  
- **Importância prova social**: CRÍTICA - Casos de sucesso de outras agências brasileiras são decisivos

## 🛤️ **JORNADAS ORGANIZATION-SCOPED**

### **1. Jornada de Conversão (Landing → Registro → Ativação)**

**Contexto organizacional**: SEMPRE_ORGANIZATION_ID | **Modelo**: B2B

#### **Etapas da Jornada**:

```typescript
conversaoJourney: {
  // Baseado em 08-landing-page.md
  step1: {
    nome: "Visita Landing Page Setorial",
    local: "/",
    objetivo: "Despertar interesse + reconhecimento problema agência",
    acoes: [
      "Visualizar hero 'O Único CRM que Agências Brasileiras Precisam'",
      "Identificar com problema fragmentação WhatsApp + planilhas",
      "Ver depoimentos de outras agências brasileiras similares", 
      "Clicar 'Criar Organização Grátis'"
    ],
    contextoOrg: "Não aplicável ainda",
    metricas: {
      tempoMinimo: "45 segundos", // Agências avaliam mais tempo vs B2C
      scrollDepth: "> 80%", // Lêem mais comparado a outros setores
      ctaVisibility: "> 95%",
      taxaClique: "> 8%" // Meta otimista por especialização setorial
    },
    usabilidade: [
      "CTA diferenciado 'Criar Organização' vs 'Teste Grátis' genérico",
      "Proposta valor agência-específica clara < 10s",
      "WhatsApp + IA + Pipeline destacados como diferenciadores",
      "Cases agências brasileiras visíveis",
      "Mobile-friendly para gestores que navegam via smartphone"
    ]
  },

  step2: {
    nome: "Registro Organizacional B2B",
    local: "/[locale]/auth/register",
    objetivo: "Criar organização da agência + conta do fundador/gestor",
    acoes: [
      "Preencher nome da agência (organization.name)",
      "Email profissional do gestor (user.email)", 
      "Definir senha segura",
      "Selecionar porte da agência (5-10 ou 10-20 colaboradores)",
      "Aceitar termos LGPD-compliant",
      "Verificar email profissional"
    ],
    contextoOrg: "Criação automática organization_id + owner role",
    metricas: {
      tempoMaximo: "4 minutos", // Ligeiramente maior que B2C pela natureza B2B
      taxaConclusao: "> 80%", // Meta alta por landing page setorial
      taxaErro: "< 3%", // Formulário simples e validado
      abandono: "< 20%" // Aceitável para B2B
    },
    usabilidade: [
      "Campos específicos agência (nome agência, porte equipe)",
      "Validação email corporativo incentivada",
      "Indicador de segurança senha",
      "LGPD compliance transparente",
      "Recuperação de erros com linguagem amigável"
    ]
  },

  step3: {
    nome: "Primeiro Login + Setup Organizacional", 
    local: "/[locale]/admin",
    objetivo: "Ativação inicial + configuração básica da agência",
    acoes: [
      "Login automático pós-verificação email",
      "Welcome screen personalizada para agências",
      "Ver dashboard organization-scoped com contexto agência",
      "Configurar logo/branding básico da agência (opcional)",
      "Importar primeiros leads (CSV ou manual) - PRIMEIRA AÇÃO CRÍTICA",
      "Convidar primeiro membro da equipe (opcional mas incentivado)"
    ],
    contextoOrg: "Headers X-Org-Id + org context sempre visível + owner permissions",
    metricas: {
      tempoAtivacao: "< 7 minutos", // Tempo para primeira ação significativa
      primeiraAcao: "> 75%", // % que criam/importam primeiro lead
      retornoD1: "> 65%", // Alta para B2B setorial
      satisfacao: "> 8.5/10", // NPS alta por especialização
      conviteEquipe: "> 40%" // % que convidam alguém da equipe no primeiro dia
    },
    usabilidade: [
      "Welcome message personalizada: 'Bem-vindo à [Nome da Agência]!'",
      "Contexto organizacional sempre visível no header",
      "Tutorial progressivo não-intrusivo",
      "Primeira ação óbvia: 'Criar Primeiro Lead da Sua Agência'",
      "Incentivo suave para convite da equipe",
      "Ajuda contextual WhatsApp para suporte brasileiro"
    ]
  }
}
```

#### **Pontos Críticos da Jornada**:

1. **[CRÍTICO]** Landing CTA → Registro: Taxa conversão setorial **8%** (vs 3-5% genérico)
2. **[CRÍTICO]** Registro → Verificação Email: Abandono típico **15%** (aceitável B2B)
3. **[CRÍTICO]** Login → Primeira Ação (Lead): Ativação crucial **75%** (importar/criar lead)

### **2. Jornada de Onboarding B2B Organizacional**

**Contexto organizacional**: SEMPRE_ORGANIZATION_SCOPED | **Modelo**: B2B Agências

#### **B2B DETECTADO - Onboarding Colaborativo:**

```typescript
onboardingB2B: {
  step1: {
    nome: "Configuração da Agência",
    objetivo: "Setup inicial da organização/agência",
    acoes: [
      "Personalizar nome/logo da agência no sistema", 
      "Configurar timezone São Paulo (padrão agências brasileiras)",
      "Definir idioma português brasileiro",
      "Configurar pipeline padrão (Lead→Contato→Proposta→Negociação→Fechado)",
      "Importar primeiros leads via CSV ou criação manual"
    ],
    contextoOrg: "Org recém-criada + owner permissions + setup organizacional",
    tempoEsperado: "3-7 minutos",
    usabilidade: [
      "Campos opcionais claramente marcados",
      "Preview live das configurações",
      "Import CSV com template para agências",
      "Possibilidade pular steps e voltar depois",
      "Pipeline otimizado para agências pré-configurado"
    ]
  },

  step2: {
    nome: "Convite da Equipe da Agência",
    objetivo: "Adicionar primeiros membros da agência",
    acoes: [
      "Convidar membros via email corporativo",
      "Definir roles: Admin (sócios), Member (funcionários)",
      "Configurar permissões básicas por role",
      "Enviar convites com mensagem personalizada da agência",
      "Configurar notificações de equipe"
    ],
    contextoOrg: "Org-scoped team management + collaborative features",
    tempoEsperado: "4-8 minutos",
    usabilidade: [
      "Convite em lote (múltiplos emails)",
      "Roles pré-definidos para agências (Admin/Member)",
      "Preview do email de convite personalizado",
      "Status dos convites em tempo real",
      "Tutorial sobre colaboração em CRM"
    ]
  },

  step3: {
    nome: "Primeira Funcionalidade CRM Colaborativa",
    objetivo: "Demonstrar valor colaborativo do CRM para a agência",
    acoes: [
      "Criar primeiro lead no Pipeline Kanban org-scoped",
      "Demonstrar arrastar lead entre estágios",
      "Adicionar primeira comunicação WhatsApp/Email ao lead",
      "Ver timeline unificada de comunicações",
      "Gerar primeiro resumo IA de conversa (se disponível)",
      "Mostrar como equipe pode ver/colaborar no mesmo lead"
    ],
    contextoOrg: "Full org-scoped CRM functionality + team collaboration",
    tempoEsperado: "6-12 minutos",
    usabilidade: [
      "Tutorial interativo com dados exemplo da agência",
      "Feedback imediato de sucesso para cada ação",
      "Demonstração clara do isolamento organizacional",
      "Hints sobre colaboração: 'Sua equipe pode ver este lead'",
      "WhatsApp integration obviamente destacada para brasileiro"
    ]
  }
}
```

### **3. Jornada de Troca Organizacional (Context Switching)**
*Para usuários membros de múltiplas agências*

**Contexto organizacional**: ORGANIZATION_SWITCHING | **Requisito**: < 3 cliques

```typescript
orgSwitching: {
  requirement: "< 3 cliques para trocar entre agências",
  
  step1: {
    nome: "Identificar Agência Atual",
    objetivo: "Usuário sabe claramente em qual agência está trabalhando",
    elementos: [
      "Nome da agência atual visível no header",
      "Logo/avatar da agência atual", 
      "Indicador role atual (Admin/Member)",
      "Contador da equipe (ex: '8 membros')",
      "Badge do plano atual (Starter/Professional/Enterprise)"
    ],
    localizacao: "Header sempre visível + sidebar com context",
    usabilidade: "Context awareness permanente - nunca confusão"
  },

  step2: {
    nome: "Acessar Switcher de Agências",
    objetivo: "Abrir seletor de agências acessíveis",
    acoes: [
      "Clicar nome/avatar da agência atual (dropdown)",
      "Ver lista de agências que possui acesso",
      "Visualizar role em cada agência (Admin vs Member)",
      "Ver último acesso em cada agência",
      "Identificar agência desejada rapidamente"
    ],
    tempoMaximo: "< 1 segundo para carregar lista",
    usabilidade: [
      "Lista com busca/filtro se muitas agências",
      "Última atividade visível por agência",
      "Hierarquia visual clara (Admin vs Member)",
      "Agência mais usada no topo da lista"
    ]
  },

  step3: {
    nome: "Confirmar Troca de Agência",
    objetivo: "Switch completo de contexto organizacional",
    acoes: [
      "Selecionar agência desejada",
      "Loading state durante troca (< 200ms)",
      "Refresh completo da interface para nova org",
      "Confirmação visual da nova agência ativa",
      "Dados da nova agência carregados corretamente"
    ],
    tempoMaximo: "< 200ms switch time",
    usabilidade: [
      "Transição suave com loading feedback",
      "Confirmação visual clara da troca",
      "Dados da agência anterior completamente ocultados",
      "Permissões da nova agência aplicadas instantaneamente"
    ]
  },

  metricas: {
    sucessoTroca: "> 99.5%", // Crítico para B2B multi-org
    tempoTroca: "< 200ms",
    errosContexto: "< 0.05%", // Tolerância zero para data leakage
    satisfacaoTroca: "> 9/10",
    confusaoUsuario: "< 1%" // Usuário sempre sabe onde está
  }
}
```

### **4. Jornada de Feature Gating (Limitação → Upgrade)**

**Contexto organizacional**: ORG_SUBSCRIPTION_SCOPED | **Modelo**: B2B Agências

```typescript
featureGating: {
  // Baseado em tiers B2B: Starter → Professional → Enterprise
  tier: "starter → professional → enterprise",
  
  step1: {
    nome: "Tentativa de Acesso Funcionalidade Premium",
    objetivo: "Usuário da agência tenta usar feature bloqueada",
    trigger: "Click em WhatsApp Business API ou IA Resumos Avançados",
    contextoOrg: "Subscription tier org-scoped (ex: Starter)",
    elementos: [
      "FeatureGate component com branding agências",
      "Indicação tier atual da agência: 'Plano Starter'",
      "Benefícios tier Professional destacados", 
      "CTA upgrade específico: 'Upgrade da [Nome Agência]'",
      "ROI calculator para agências (economia tempo/aumento conversão)"
    ]
  },

  step2: {
    nome: "Proposta de Upgrade para Agência",
    objetivo: "Convencer valor tier superior para a agência",
    acoes: [
      "Ver comparação tiers side-by-side",
      "Entender benefícios para agência: mais leads, equipe maior, WhatsApp API",
      "Calcular ROI: 'Sua agência economizará X horas/semana'",
      "Ver cases de agências similares que fizeram upgrade",
      "Decidir se vale o investimento mensal"
    ],
    contextoOrg: "Org-specific upgrade flow + agência context",
    usabilidade: [
      "Valor claro para agências (não genérico)",
      "Comparação focada em agências 5-20 pessoas",
      "Calculadora ROI baseada em size da equipe",
      "Testimonials de outras agências brasileiras",
      "Trial gratuito 14 dias se disponível"
    ]
  },

  step3: {
    nome: "Processo de Upgrade Organizacional", 
    objetivo: "Completar upgrade da subscription da agência",
    acoes: [
      "Owner/Admin da agência autoriza upgrade",
      "Inserir dados financeiros da agência (CNPJ se necessário)",
      "Confirmar payment method corporativo",
      "Processar upgrade para toda a organização",
      "Ativar novas funcionalidades para todos os membros da agência"
    ],
    contextoOrg: "Org subscription management + billing corporativo",
    usabilidade: [
      "Processo seguro com dados corporativos",
      "Confirmação que upgrade vale para toda agência",
      "Acesso imediato às features para todos os membros",
      "Notificação da equipe sobre upgrade realizado"
    ]
  },

  metricas_setor: {
    // Baseado em pesquisa setorial agências
    conversionRate: "12-18%", // Alto por especialização
    timeToUpgrade: "7-14 dias", // Típico para agências B2B
    churnRate: "< 5%", // Baixo pós-upgrade por valor claro
    satisfactionUpgrade: "> 8.5/10" // Alto por ROI demonstrável
  }
}
```

### **5. Jornadas Específicas das Funcionalidades CRM**

**Baseado nas 3 funcionalidades must-have do 02-prd.md**

```typescript
functionalityJourneys: {
  // Funcionalidade 1: Pipeline Kanban de Leads
  "pipeline_kanban": {
    nome: "Pipeline Kanban de Leads da Agência",
    contextoOrg: "Organization-scoped sempre - leads isolados por agência",
    modelo: "B2B colaborativo - equipe da agência compartilha pipeline",
    
    steps: [
      {
        nome: "Descoberta Pipeline Kanban",
        como: "Via navegação principal, dashboard, ou onboarding",
        objetivo: "Entender pipeline visual para agência",
        contexto: "Ver pipeline vazio ou com leads exemplo da agência"
      },
      {
        nome: "Primeira Utilização - Criar Lead",
        acoes: [
          "Clicar 'Adicionar Lead' no estágio 'Lead'",
          "Preencher dados do lead (nome, empresa, contato)",
          "Definir valor potencial e fonte do lead",
          "Salvar lead no pipeline da agência"
        ],
        endpoints: "/api/v1/crm/leads (POST) com organization_id",
        resultadoEsperado: "Lead aparece no Kanban da agência, visível para equipe"
      },
      {
        nome: "Uso Colaborativo - Mover Lead",
        objetivo: "Demonstrar colaboração da equipe no pipeline",
        acoes: [
          "Arrastar lead de 'Lead' para 'Contato'",
          "Adicionar nota sobre progresso",
          "Notificar equipe sobre mudança de estágio",
          "Ver histórico de movimentações"
        ]
      },
      {
        nome: "Uso Recorrente - Gestão Pipeline",
        objetivo: "Estabelecer rotina de gestão do pipeline da agência",
        metricas: "Frequência de uso, leads movidos, conversão por estágio"
      }
    ],
    
    metricas: {
      descoberta: "> 90%", // Core feature - quase todos descobrem
      adocao: "> 80%", // Pipeline visual é intuitivo
      retencao: "> 85%", // Alto por valor evidente
      satisfacao: "> 8.5/10" // Funcionalidade central bem aceita
    }
  },

  // Funcionalidade 2: Timeline de Comunicação Integrada  
  "timeline_comunicacao": {
    nome: "Timeline de Comunicação WhatsApp + Email + VoIP",
    contextoOrg: "Organization-scoped - comunicações isoladas por agência",
    modelo: "B2B colaborativo - equipe vê histórico completo de comunicações",
    
    steps: [
      {
        nome: "Descoberta Timeline",
        como: "Via perfil do lead, dashboard, ou onboarding WhatsApp",
        objetivo: "Entender centralização de comunicações da agência"
      },
      {
        nome: "Primeira Integração WhatsApp",
        acoes: [
          "Conectar WhatsApp Business da agência",
          "Autorizar integração via QR Code ou API",
          "Ver mensagens WhatsApp aparecerem na timeline",
          "Enviar primeira mensagem via CRM"
        ],
        endpoints: "/api/v1/crm/communications (GET/POST) com organization_id",
        resultadoEsperado: "WhatsApp integrado, mensagens na timeline da agência"
      },
      {
        nome: "Uso Avançado - Timeline Completa",
        objetivo: "Ver histórico completo de comunicações unificadas",
        acoes: [
          "Ver email + WhatsApp + VoIP na mesma linha do tempo",
          "Adicionar notas manuais na timeline",
          "Filtrar por canal de comunicação",
          "Compartilhar timeline com equipe da agência"
        ]
      }
    ],
    
    metricas: {
      descoberta: "> 85%", // WhatsApp é chave para brasileiros
      adocao: "> 70%", // Integração pode ter fricção técnica
      retencao: "> 90%", // Muito alto - grande valor percebido
      satisfacao: "> 9/10" // Diferencial competitivo forte
    }
  },

  // Funcionalidade 3: Resumos IA de Conversas
  "resumos_ia": {
    nome: "Resumos IA de Conversas em Português",
    contextoOrg: "Organization-scoped - IA processa apenas dados da agência",
    modelo: "B2B colaborativo - resumos compartilhados com equipe",
    
    steps: [
      {
        nome: "Descoberta IA Resumos",
        como: "Via timeline longa, notificação automática, ou feature tour",
        objetivo: "Entender como IA ajuda agência com conversas longas"
      },
      {
        nome: "Primeiro Resumo Automático",
        acoes: [
          "IA detecta conversa longa (>10 mensagens)",
          "Gera resumo automático em português brasileiro",
          "Mostra insights: sentimento, próximas ações, urgência",
          "Permite editar/aprovar resumo gerado"
        ],
        endpoints: "/api/v1/crm/ai-summaries (POST) com organization_id",
        resultadoEsperado: "Resumo preciso que economiza tempo da agência"
      },
      {
        nome: "Uso Estratégico - Insights Agência",
        objetivo: "IA como ferramenta estratégica da agência",
        acoes: [
          "Ver padrões de comunicação dos clientes",
          "Identificar leads com maior potencial via IA",
          "Receber sugestões de próximas ações",
          "Compartilhar insights IA com equipe"
        ]
      }
    ],
    
    metricas: {
      descoberta: "> 75%", // Funcionalidade mais avançada
      adocao: "> 60%", // Requer educação sobre valor
      retencao: "> 80%", // Alto após entender valor
      satisfacao: "> 8/10" // Inovadora mas pode ter curva aprendizado
    }
  }
}
```

## 📊 **MÉTRICAS E BENCHMARKS SETORIAIS**

### **Métricas por Jornada**

```typescript
journeyMetrics: {
  conversao: {
    landing_to_signup: {
      target_setorial: "3-5%", // CRMs genéricos
      target_nosso: "8%", // Meta otimista por especialização agências
      benchmark_excellente: "10-12%" // Top performers setoriais
    },
    signup_to_activation: {
      target: "> 75%", // Alto por landing page setorial
      tempo_maximo: "< 24h",
      primeira_acao: "> 80%" // Criar/importar primeiro lead
    }
  },

  onboarding: {
    completion_rate: {
      target: "> 85%", // Meta alta para B2B especializado
      tempo_medio: "15-25 minutos", // Onboarding completo agências
      satisfaction: "> 8.5/10"
    },
    time_to_value: {
      primeira_conquista: "< 10min", // Primeiro lead criado
      aha_moment: "< 15min", // Ver pipeline funcionando
      retorno_d1: "> 65%" // Alto para agências por valor imediato
    }
  },

  organization_switching: {
    success_rate: "> 99.5%", // Crítico para B2B
    switch_time: "< 200ms", 
    user_confusion: "< 0.5%", // Tolerância quase zero
    context_errors: "< 0.05%" // Data leakage inadmissível
  },

  feature_adoption: {
    pipeline_kanban: "> 90%", // Core feature - adoção quase universal
    timeline_whatsapp: "> 85%", // Diferencial para brasileiro
    ia_resumos: "> 60%", // Mais avançada, requer educação
    retention_rate: "> 80%", // Alta retenção por especialização
    satisfaction: "> 8.5/10"
  }
}
```

### **Critérios de Usabilidade Setoriais**

```typescript
usabilityCriteria: {
  // Baseado em comportamento agências digitais brasileiras
  setor_agencias: {
    velocidade: "RÁPIDO com profundidade opcional", // Agências querem eficiência
    complexidade: "PROGRESSIVA revelação", // Começar simples, escalar conforme uso
    confianca: [
      "Cases de outras agências brasileiras similares",
      "Compliance LGPD transparente",
      "Integração WhatsApp oficial (não gambiarra)",
      "Suporte em português via WhatsApp"
    ],
    abandono: [
      "Onboarding muito longo ou complexo",
      "Falta de integração WhatsApp",
      "Sem dados exemplo relevantes para agências",
      "Interface genérica (não específica agências)"
    ]
  },

  // Padrões universais organization-scoped
  organization_aware: {
    context_visibility: "Nome da agência sempre visível no header",
    switching_ease: "< 3 cliques para trocar entre agências",
    isolation_clear: "Dados de cada agência completamente separados",
    permissions_clear: "Role (Admin/Member) sempre óbvio",
    team_collaboration: "Status da equipe visível (quem está online, atividade)"
  },

  // Padrões específicos CRM agências
  crm_agencies: {
    pipeline_visual: "Pipeline Kanban sempre acessível, drag & drop fluido",
    whatsapp_native: "WhatsApp integração óbvia, sem parecer gambiarra",
    brazilian_localization: "Português brasileiro, timezone São Paulo, compliance LGPD",
    mobile_friendly: "Gestores de agência usam muito smartphone",
    team_context: "Sempre claro quem fez o quê na agência"
  },

  // Acessibilidade obrigatória
  accessibility: {
    keyboard_navigation: "100% navegável via teclado",
    screen_reader: "Compatible com leitores de tela",
    color_contrast: "WCAG 2.1 AA compliant",
    focus_indicators: "Sempre visíveis",
    brazilian_standards: "Acessibilidade digital brasileira"
  }
}
```

## 🧪 **VALIDAÇÃO E TESTES DE USUÁRIO**

### **Plano de Testes Setoriais**

```typescript
testingPlan: {
  // Personas baseadas em agências digitais brasileiras
  personas: {
    "gestor_agencia_fundador": {
      perfil: "Sócio-fundador de agência digital, 30-45 anos, São Paulo/Rio/BH",
      objetivos: ["Organizar leads da agência", "Integrar WhatsApp Business", "Ter visibilidade da equipe"],
      frustracoes: ["Leads perdidos no WhatsApp", "Planilhas desatualizadas", "Equipe desalinhada"],
      contexto_org: "Owner de organização, convida equipe, toma decisões de upgrade"
    },
    "comercial_agencia_membro": {
      perfil: "Comercial/vendedor de agência, 25-35 anos, usuário ativo WhatsApp",
      objetivos: ["Acompanhar leads pessoais", "Integrar comunicação", "Colaborar com equipe"],
      frustracoes: ["Perder histórico de conversa", "Não saber status de leads de colegas"],
      contexto_org: "Member de organização, utiliza funcionalidades, não administra"
    }
  },

  // Cenários de teste organization-scoped
  scenarios: [
    {
      nome: "Registro + Onboarding Agência Completo",
      persona: "gestor_agencia_fundador",
      steps: "Landing → Registro → Setup Org → Convite Equipe → Primeiro Lead → WhatsApp",
      success_criteria: [
        "Completa registro em < 4 minutos",
        "Setup org em < 7 minutos", 
        "Convida pelo menos 1 membro da equipe",
        "Cria primeiro lead em < 3 minutos",
        "Conecta WhatsApp Business com sucesso"
      ],
      org_context: "Criação nova organização + isolamento completo + team collaboration"
    },
    {
      nome: "Colaboração Multi-usuário na Agência", 
      persona: "comercial_agencia_membro",
      steps: "Login → Aceitar Convite → Pipeline → Comunicação → IA Resumo",
      success_criteria: [
        "Aceita convite da agência sem confusão",
        "Entende contexto organizacional imediatamente",
        "Move lead no pipeline colaborativo",
        "Vê timeline de comunicações da agência",
        "Entende resumo IA gerado"
      ],
      org_context: "Multi-user org-scoped + team collaboration + data sharing"
    },
    {
      nome: "Troca Entre Agências (Multi-org)",
      persona: "comercial_agencia_membro",
      steps: "Login Agência A → Switch → Agência B → Verificar Isolamento",
      success_criteria: [
        "Identifica claramente agência atual",
        "Troca entre agências em < 3 cliques",
        "Troca completa em < 200ms",
        "Dados completamente isolados entre agências",
        "Nenhuma confusão de contexto"
      ],
      org_context: "Multi-organization switching + perfect isolation"
    }
  ],

  // Métricas de validação setoriais
  validation_metrics: {
    task_completion: "> 85%", // Meta alta para B2B especializado
    error_rate: "< 3%", // Baixo por interface focada
    time_on_task: "15-25min onboarding completo", // Realista para B2B
    satisfaction: "> 8.5/10", // Alta por especialização
    system_usability: "> 85 SUS score", // Excelente
    nps_score: "> 60", // Promotores vs detratores
    feature_discovery: "> 80%", // % que descobrem features principais
    return_rate_d7: "> 70%" // % que voltam após 7 dias
  }
}
```

### **Pontos de Validação Críticos**

```typescript
validationPoints: {
  // Isolamento organizacional (CRÍTICO)
  org_isolation: {
    test: "Membro agência A nunca vê dados agência B",
    success: "0% data leakage cross-org",
    method: "Automated testing + manual verification",
    critical: "ZERO TOLERANCE - falha = projeto falha"
  },

  // Context switching (CRÍTICO PARA B2B)
  org_switching: {
    test: "Trocar entre agências fluidamente sem confusão", 
    success: "< 200ms + 99.5% success rate + 0% confusion",
    method: "Performance testing + user observation",
    critical: "B2B users can't afford context confusion"
  },

  // Funcionalidades setoriais específicas
  sector_workflows: {
    test: "Completar workflows típicos de agência digital",
    success: [
      "Pipeline Kanban: criar, mover, converter lead < 5min",
      "WhatsApp: integrar e enviar primeira mensagem < 3min",
      "IA Resumo: gerar e editar resumo conversa < 2min"
    ],
    method: "Task-based testing com agências reais",
    critical: "Core value prop - must work perfectly"
  },

  // Conversão e ativação setorial
  conversion_funnel: {
    test: "Landing agências → Signup → Ativação",
    success: [
      "Landing conversion: > 8%",
      "Signup completion: > 80%", 
      "First action (lead): > 75%",
      "D1 return rate: > 65%"
    ],
    method: "A/B testing + funnel analysis + cohort analysis",
    critical: "Business viability depends on these metrics"
  },

  // Team collaboration (ESSENCIAL B2B)
  team_collaboration: {
    test: "Múltiplos usuários da mesma agência colaborando",
    success: [
      "Convite equipe: > 90% success rate",
      "Multi-user pipeline: sem conflitos",
      "Shared communications: context claro",
      "Role permissions: funcionam perfeitamente"
    ],
    method: "Multi-user testing + permissions verification",
    critical: "B2B value prop is team collaboration"
  }
}
```

## 🚀 **IMPLEMENTAÇÃO TÉCNICA SUGERIDA**

### **Tracking de Jornadas**

```typescript
// Journey tracking implementation organization-scoped
journeyTracking: {
  // Analytics events com contexto organizacional
  events: {
    journey_start: "gtag('event', 'journey_start', { journey_name, org_id, org_name, user_role, org_size })",
    step_complete: "gtag('event', 'step_complete', { journey_name, step_name, org_id, duration_ms, success })",
    journey_abandon: "gtag('event', 'journey_abandon', { journey_name, exit_step, org_id, reason, user_agent })",
    journey_complete: "gtag('event', 'journey_complete', { journey_name, org_id, total_time_ms, satisfaction_score })",
    
    // Eventos específicos agências
    agency_setup_complete: "gtag('event', 'agency_setup', { org_name, team_size, industry: 'digital_agency' })",
    first_lead_created: "gtag('event', 'first_value', { org_id, time_to_value_ms, lead_source })",
    whatsapp_connected: "gtag('event', 'integration', { org_id, integration_type: 'whatsapp_business' })",
    team_collaboration: "gtag('event', 'collaboration', { org_id, members_active, shared_resource_type })"
  },

  // Custom metrics por jornada organization-scoped
  custom_metrics: {
    org_setup_time: "Time to complete agency configuration",
    first_lead_time: "Time to create/import first lead", 
    team_invitation_rate: "% owners who invite team members",
    whatsapp_integration_rate: "% agencies who connect WhatsApp",
    feature_discovery_rate: "% users who discover IA summaries",
    org_switching_success: "% successful org context switches",
    cross_org_isolation: "Verification of zero data leakage"
  },

  // Cohort analysis setorial
  cohort_tracking: {
    agency_size_cohorts: "Track by team size (2-5, 6-10, 11-20 members)",
    plan_tier_cohorts: "Track by subscription tier progression",
    feature_adoption_cohorts: "Track by core features adopted",
    geographic_cohorts: "Track by Brazilian regions (SP, RJ, MG, etc)",
    onboarding_completion_cohorts: "Track by onboarding completion level"
  }
}
```

### **Componentes UX Organization-Scoped**

```typescript
// Journey-aware components com contexto organizacional
journeyComponents: {
  // Progress indicators org-aware
  AgencyOnboardingProgress: "Show current step in agency setup journey",
  OrgContextIndicator: "Always show current agency context + team status",
  RoleBasedNavigation: "Navigation based on user role in agency (Owner/Admin/Member)",
  TeamCollaborationStatus: "Show who else from agency is online/active",
  
  // Organization switching components
  AgencySwitcher: "< 3 clicks agency switching component",
  OrgBreadcrumb: "Agency context in page navigation + current permissions",
  AgencyMembersList: "Team overview + roles + activity status",
  
  // Feature gating org-scoped
  AgencyFeatureGate: "Org-scoped feature access control with agency context",
  AgencyUpgradePrompt: "Org-specific upgrade suggestions with ROI for agencies",
  TeamPlanIndicator: "Show current plan + limits + usage for whole agency",
  
  // Journey helpers
  AgencyOnboardingTooltip: "Context-aware help tooltips for agency workflows",
  CRMJourneyBreadcrumbs: "Show progress in complex CRM workflows",
  WhatsAppIntegrationGuide: "Step-by-step WhatsApp Business API setup",
  PipelineKanbanTutorial: "Interactive tutorial for agency pipeline management",
  
  // Brazilian/Agência specific
  WhatsAppNativeIndicator: "Show WhatsApp official integration status",
  BrazilianComplianceBadge: "LGPD compliance indicator for agencies",
  AgencyROICalculator: "Calculate value/ROI for agency team size",
  PortugueseAISummaryDemo: "Demo of AI summaries in Portuguese"
}
```

### **Componentes React Organization-Scoped**

```typescript
// components/journeys/AgencyOnboardingFlow.tsx
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useOrgContext } from '@/hooks/use-org-context'

interface AgencyOnboardingFlowProps {
  currentStep: number
  totalSteps: number
  onComplete: (step: number) => void
}

export function AgencyOnboardingFlow({ currentStep, totalSteps, onComplete }: AgencyOnboardingFlowProps) {
  const { organization } = useOrgContext()
  
  const steps = [
    { id: 1, name: 'Configurar Agência', description: `Personalizar ${organization?.name}` },
    { id: 2, name: 'Convidar Equipe', description: 'Adicionar membros da agência' },
    { id: 3, name: 'Primeiro Lead', description: 'Criar lead no pipeline' },
    { id: 4, name: 'WhatsApp', description: 'Integrar WhatsApp Business' }
  ]
  
  return (
    <Card className="p-6 bg-violet-50 border-violet-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-violet-900">
          Setup da {organization?.name}
        </h3>
        <p className="text-sm text-violet-700">
          Configure sua agência em poucos minutos
        </p>
      </div>
      
      <Progress value={(currentStep / totalSteps) * 100} className="mb-4" />
      
      <div className="space-y-2">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`flex items-center p-2 rounded ${
              step.id <= currentStep ? 'bg-violet-100 text-violet-900' : 'text-muted-foreground'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mr-3 ${
              step.id <= currentStep ? 'bg-violet-600 text-white' : 'bg-gray-300'
            }`}>
              {step.id}
            </div>
            <div>
              <div className="font-medium">{step.name}</div>
              <div className="text-sm opacity-75">{step.description}</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// components/journeys/AgencySwitcher.tsx
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronDown, Building2 } from 'lucide-react'
import { useOrgContext } from '@/hooks/use-org-context'

export function AgencySwitcher() {
  const { organization, organizations, switchOrganization } = useOrgContext()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="justify-between w-full">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="truncate">{organization?.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {organizations?.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => switchOrganization(org.id)}
            className={org.id === organization?.id ? 'bg-violet-50' : ''}
          >
            <div className="flex flex-col items-start">
              <span className="font-medium">{org.name}</span>
              <span className="text-xs text-muted-foreground">
                {org.role} • {org.memberCount} membros
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

<function_calls>
<invoke name="TodoWrite">
<parameter name="todos">[{"content": "Analisar documentos do projeto para entender completamente a arquitetura API", "status": "completed", "id": "1"}, {"content": "Validar compatibilidade da API specification com a database existente", "status": "completed", "id": "2"}, {"content": "Implementar routers CRM seguindo padr\u00f5es template existentes", "status": "completed", "id": "3"}, {"content": "Criar schemas Pydantic com isolamento organizacional", "status": "pending", "id": "4"}, {"content": "Desenvolver services e repositories com filtros organization_id", "status": "pending", "id": "5"}, {"content": "Analisar documentos anteriores (PRD, APIs, Landing Page) para extrair contexto", "status": "completed", "id": "6"}, {"content": "Pesquisar padr\u00f5es comportamentais setoriais de ag\u00eancias digitais brasileiras", "status": "completed", "id": "7"}, {"content": "Mapear jornadas organization-scoped baseadas no modelo B2B", "status": "completed", "id": "8"}, {"content": "Definir m\u00e9tricas e benchmarks setoriais para valida\u00e7\u00e3o", "status": "completed", "id": "9"}, {"content": "Documentar implementa\u00e7\u00e3o t\u00e9cnica e componentes UX", "status": "completed", "id": "10"}]