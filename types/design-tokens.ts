/**
 * Loved CRM Design Tokens
 * Sistema de tokens de design type-safe para o Loved CRM
 * Baseado na especificação do agente 07-design-tokens.md
 */

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
      lead: 'hsl(220, 9%, 46%)',          // Gray - inicial
      contact: 'hsl(217, 91%, 60%)',      // Blue - em contato
      proposal: 'hsl(43, 96%, 56%)',      // Yellow - proposta
      negotiation: 'hsl(25, 95%, 53%)',   // Orange - negociação
      closed: 'hsl(160, 84%, 39%)',       // Green - fechado
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
    },
    whatsapp: {
      brand: 'hsl(142, 76%, 36%)',        // Official WhatsApp Green
      dark: 'hsl(142, 82%, 17%)',         // Dark Green
      light: 'hsl(142, 76%, 96%)',        // Very Light Green
      incoming: 'hsl(142, 76%, 96%)',     // Light green for incoming messages
      outgoing: 'hsl(217, 91%, 95%)',     // Light blue for outgoing messages
    },
    timeline: {
      whatsapp: 'hsl(142, 76%, 36%)',     // WhatsApp green
      email: 'hsl(217, 91%, 60%)',        // Email blue
      voip: 'hsl(262, 83%, 58%)',         // VoIP primary
      note: 'hsl(220, 9%, 46%)',          // Note gray
      ai: 'hsl(262, 83%, 58%)',           // AI primary
      sent: 'hsl(160, 84%, 39%)',         // Green success
      delivered: 'hsl(217, 91%, 60%)',    // Blue delivered
      read: 'hsl(142, 76%, 36%)',         // WhatsApp green read
      failed: 'hsl(0, 84%, 60%)',         // Red failed
    },
    security: {
      isolated: 'hsl(160, 84%, 39%)',     // Green - dados seguros
      shared: 'hsl(217, 91%, 60%)',       // Blue - compartilhado
      warning: 'hsl(43, 96%, 56%)',       // Yellow - atenção
      danger: 'hsl(0, 84%, 60%)',         // Red - perigo cross-org
    },
    team: {
      member: 'hsl(217, 91%, 60%)',       // Blue-500 para membros
      admin: 'hsl(262, 83%, 58%)',        // Primary para admins
      owner: 'hsl(224, 71%, 4%)',         // Dark para owners
    }
  },
  spacing: {
    organizationCard: '1rem',              // 16px
    pipelineStage: '1.5rem',              // 24px
    timelineEntry: '0.75rem',             // 12px
    aiSummary: '1rem',                    // 16px
    communicationBubble: '0.75rem',       // 12px
    teamBadge: '0.5rem',                  // 8px
  },
  borderRadius: {
    organizationCard: '0.5rem',           // 8px
    pipelineCard: '0.375rem',             // 6px
    aiSummary: '0.75rem',                 // 12px
    communicationBubble: '1rem',          // 16px
    timeline: '0.375rem',                 // 6px
    teamBadge: '9999px',                  // Full rounded
  },
  transitions: {
    fast: '150ms ease-out',
    normal: '250ms ease-out',
    slow: '350ms ease-out',
    pipelineDrag: '200ms cubic-bezier(0.2, 0, 0, 1)',
    timelineAppear: '300ms ease-out',
    aiSummaryExpand: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    whatsappMessage: '150ms ease-out',
    orgSwitch: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    tierUpgrade: '250ms ease-out',
  },
  breakpoints: {
    mobileFirst: '320px',                 // Smartphones básicos
    mobileComfort: '375px',               // iPhone padrão
    tablet: '768px',                      // iPad / Android tablets
    desktop: '1024px',                    // Notebooks agências
    desktopLarge: '1440px',               // Monitores externos
    desktopXl: '1920px',                  // Monitores grandes
  }
} as const;

// Type helpers para garantir type-safety
export type DesignTokens = typeof designTokens;
export type BrandColors = keyof typeof designTokens.colors.brand;
export type OrganizationColors = keyof typeof designTokens.colors.organization;
export type PipelineColors = keyof typeof designTokens.colors.pipeline;
export type CommunicationColors = keyof typeof designTokens.colors.communication;
export type AIColors = keyof typeof designTokens.colors.ai;
export type WhatsAppColors = keyof typeof designTokens.colors.whatsapp;
export type TimelineColors = keyof typeof designTokens.colors.timeline;
export type SecurityColors = keyof typeof designTokens.colors.security;
export type TeamColors = keyof typeof designTokens.colors.team;

// Utility functions para acessar tokens
export const getColor = {
  brand: (color: BrandColors) => designTokens.colors.brand[color],
  organization: (color: OrganizationColors) => designTokens.colors.organization[color],
  pipeline: (color: PipelineColors) => designTokens.colors.pipeline[color],
  communication: (color: CommunicationColors) => designTokens.colors.communication[color],
  ai: (color: AIColors) => designTokens.colors.ai[color],
  whatsapp: (color: WhatsAppColors) => designTokens.colors.whatsapp[color],
  timeline: (color: TimelineColors) => designTokens.colors.timeline[color],
  security: (color: SecurityColors) => designTokens.colors.security[color],
  team: (color: TeamColors) => designTokens.colors.team[color],
};

// Pipeline stages em português (para labels na UI)
export const pipelineStageLabels = {
  lead: 'Lead',
  contact: 'Contato',
  proposal: 'Proposta',
  negotiation: 'Negociação',
  closed: 'Fechado'
} as const;

// Communication channel labels em português
export const communicationChannelLabels = {
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  voip: 'Ligação',
  note: 'Anotação'
} as const;

// Organization tier labels em português
export const organizationTierLabels = {
  tierFree: 'Gratuito',
  tierPro: 'Profissional',
  tierEnterprise: 'Empresarial'
} as const;

// Team role labels em português
export const teamRoleLabels = {
  member: 'Membro',
  admin: 'Administrador',
  owner: 'Proprietário'
} as const;