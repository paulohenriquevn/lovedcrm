/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },

        // === LOVED CRM EXTENDED COLORS ===
        // Organization Tiers
        tier: {
          free: 'hsl(var(--tier-free))',
          pro: 'hsl(var(--tier-pro))',
          enterprise: 'hsl(var(--tier-enterprise))',
        },

        // Pipeline Stages
        pipeline: {
          lead: 'hsl(var(--pipeline-lead))',
          contact: 'hsl(var(--pipeline-contact))',
          proposal: 'hsl(var(--pipeline-proposal))',
          negotiation: 'hsl(var(--pipeline-negotiation))',
          closed: 'hsl(var(--pipeline-closed))',
        },

        // Communication Channels
        whatsapp: {
          DEFAULT: 'hsl(var(--whatsapp))',
          brand: 'hsl(var(--whatsapp-green))',
          dark: 'hsl(var(--whatsapp-dark))',
          light: 'hsl(var(--whatsapp-light))',
          incoming: 'hsl(var(--whatsapp-incoming))',
          outgoing: 'hsl(var(--whatsapp-outgoing))',
        },

        communication: {
          email: 'hsl(var(--email))',
          voip: 'hsl(var(--voip))',
          note: 'hsl(var(--note))',
        },

        // AI Features
        ai: {
          summary: 'hsl(var(--ai-summary))',
          suggestion: 'hsl(var(--ai-suggestion))',
          warning: 'hsl(var(--ai-warning))',
        },

        // Timeline States
        timeline: {
          whatsapp: 'hsl(var(--timeline-whatsapp))',
          email: 'hsl(var(--timeline-email))',
          voip: 'hsl(var(--timeline-voip))',
          note: 'hsl(var(--timeline-note))',
          ai: 'hsl(var(--timeline-ai))',
          sent: 'hsl(var(--timeline-sent))',
          delivered: 'hsl(var(--timeline-delivered))',
          read: 'hsl(var(--timeline-read))',
          failed: 'hsl(var(--timeline-failed))',
        },

        // Security States
        security: {
          isolated: 'hsl(var(--security-isolated))',
          shared: 'hsl(var(--security-shared))',
          warning: 'hsl(var(--security-warning))',
          danger: 'hsl(var(--security-danger))',
        },

        // Organization Context
        org: {
          current: 'hsl(var(--org-current))',
          indicator: 'hsl(var(--org-scope-indicator))',
          border: 'hsl(var(--org-isolation-border))',
        },

        // Team Roles
        team: {
          member: 'hsl(var(--team-member))',
          admin: 'hsl(var(--team-admin))',
          owner: 'hsl(var(--team-owner))',
        },

        // === SECTORIAL DESIGN TOKENS (08-design-tokens.md) ===
        // Cores setoriais
        'sector-primary': {
          DEFAULT: 'hsl(var(--sector-primary))',
          foreground: 'hsl(var(--sector-primary-foreground))',
        },
        'sector-secondary': 'hsl(var(--sector-secondary))',
        'sector-accent': 'hsl(var(--sector-accent))',

        // Modelo B2B
        organization: 'hsl(var(--organization))',
        collaborative: 'hsl(var(--collaborative))',
        'sector-cta': 'hsl(var(--sector-cta))',
        'sector-trust': 'hsl(var(--sector-trust))',

        // Cores competitivas (para análises)
        competitor: {
          hubspot: 'hsl(var(--competitor-hubspot))',
          pipedrive: 'hsl(var(--competitor-pipedrive))',
          rd: 'hsl(var(--competitor-rd))',
        },

        // Cores agência digital
        agency: {
          premium: 'hsl(var(--agency-premium))',
          growth: 'hsl(var(--agency-growth))',
          conversion: 'hsl(var(--agency-conversion))',
          retention: 'hsl(var(--agency-retention))',
        },
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        // === LOVED CRM CUSTOM ANIMATIONS ===
        'timeline-appear': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        'ai-summary-expand': {
          from: {
            maxHeight: '0',
            opacity: '0',
          },
          to: {
            maxHeight: '500px',
            opacity: '1',
          },
        },
        'whatsapp-message': {
          from: {
            opacity: '0',
            transform: 'translateX(20px)',
          },
          to: {
            opacity: '1',
            transform: 'translateX(0)',
          },
        },
        'tier-upgrade': {
          from: {
            transform: 'scale(0.95)',
            opacity: '0',
          },
          to: {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'pipeline-drag': {
          from: {
            transform: 'scale(1)',
          },
          to: {
            transform: 'scale(1.05)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        // === LOVED CRM CUSTOM ANIMATIONS ===
        'timeline-appear': 'timeline-appear 300ms ease-out',
        'ai-summary-expand': 'ai-summary-expand 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        'whatsapp-message': 'whatsapp-message 150ms ease-out',
        'tier-upgrade': 'tier-upgrade 250ms ease-out',
        'pipeline-drag': 'pipeline-drag 200ms cubic-bezier(0.2, 0, 0, 1)',
      },
      // === LOVED CRM CUSTOM SPACING & SIZING ===
      spacing: {
        'org-card': '1rem',
        'pipeline-stage': '1.5rem',
        'timeline-entry': '0.75rem',
        'ai-summary': '1rem',
        'communication-bubble': '0.75rem',
        'team-badge': '0.5rem',
      },
      borderRadius: {
        'org-card': '0.5rem',
        'pipeline-card': '0.375rem',
        'ai-summary': '0.75rem',
        'communication-bubble': '1rem',
        timeline: '0.375rem',
        'team-badge': '9999px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
