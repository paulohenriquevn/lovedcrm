# 09-ui-ux-designer.md - Loved CRM

## **PHASE 1: MODEL DETECTION & VALIDATION**

### **Model Confirmation from Previous Agents**

**✅ B2B Model Detected and Confirmed:**
- **Source**: 02-prd.md explicitly defines "Modelo de Negócio: B2B"
- **Validation**: 10-user-journeys.md maps organization-scoped B2B patterns
- **Implementation**: Multi-tenant architecture with shared organizations and team collaboration
- **Target**: Brazilian digital agencies (5-20 employees) with collaborative workflows

**✅ Organization-Centric Design Requirements:**
- All interfaces must display organization context
- Header must show current agency name and user role (Owner/Admin/Member)
- Organization switching component required for multi-agency users
- Complete data isolation between agencies with visual indicators

**✅ Design Foundation Integration:**
- **Primary Color**: Loved Purple (#8B5CF6) from 07-design-tokens.md
- **Landing Page Strategy**: Conversion-focused approach from 08-landing-page.md
- **User Journey Patterns**: Organization-scoped journeys from 10-user-journeys.md
- **Technical Stack**: Next.js 14 + shadcn/ui + Tailwind CSS + multi-tenant architecture

### **Key Architecture Constraints**

**Organization-Scoped UI Requirements:**
- Every component must respect `useOrgContext()` hook
- All data displays must be filtered by organization_id
- Visual cues for organization isolation and data security
- Team collaboration indicators throughout interface

**Responsive Design Priorities:**
- **Mobile-First**: Brazilian agencies heavily use smartphones/WhatsApp
- **Desktop Optimization**: Complex CRM workflows need desktop efficiency
- **Tablet Support**: Mid-size screens for field sales and meetings

## **PHASE 2: DESIGN SYSTEM SPECIFICATION**

### **2.1 shadcn/ui Component Library Integration**

**Complete Component Mapping (31 components confirmed available):**

```typescript
// Core UI Components (shadcn/ui compliant)
designSystem: {
  layout: {
    Card: "Primary container for org-scoped content",
    Separator: "Visual division between org sections",
    Container: "Max-width containers with org branding",
    AspectRatio: "Consistent media display ratios"
  },
  
  interaction: {
    Button: "CTAs with org context + tier-specific variants",
    DropdownMenu: "Organization switcher + action menus",
    Dialog: "Modal forms with org validation",
    Sheet: "Mobile-friendly org-scoped panels",
    Popover: "Contextual org information + quick actions"
  },
  
  forms: {
    Input: "Org-scoped data entry with validation",
    Textarea: "Multi-line org content (notes, descriptions)",
    Select: "Org-filtered options + team member selection",
    Switch: "Org-scoped feature toggles",
    Checkbox: "Multi-select with org context",
    RadioGroup: "Org-scoped exclusive selections",
    Label: "Accessible form labeling"
  },
  
  navigation: {
    Tabs: "Org-scoped content organization",
    Breadcrumb: "Org-aware navigation context",
    Pagination: "Org-scoped data pagination"
  },
  
  feedback: {
    Alert: "Org-specific notifications + security warnings",
    Badge: "Org tier indicators + status badges",
    Progress: "Org-scoped completion indicators",
    Skeleton: "Loading states for org data",
    Spinner: "Async org operation feedback",
    Toast: "Org-scoped success/error notifications"
  },
  
  dataDisplay: {
    Avatar: "Org members + organization branding",
    Table: "Org-scoped data tables with sorting/filtering",
    Tooltip: "Contextual org information",
    HoverCard: "Rich org member/client previews",
    Calendar: "Org-scoped scheduling + timeline",
    Command: "Org-scoped search + quick actions"
  }
}
```

### **2.2 Loved Purple Color System Implementation**

**Primary Brand Color Integration:**

```css
/* Loved CRM Design Tokens (extends shadcn/ui) */
:root {
  /* === BRAND COLORS === */
  --primary: 262 83% 58%;                    /* Loved Purple #8B5CF6 */
  --primary-foreground: 210 40% 98%;         /* White text on purple */
  --primary-light: 262 83% 95%;              /* Light purple backgrounds */
  --primary-dark: 262 83% 48%;               /* Darker purple for hover states */
  
  /* === ORGANIZATION-AWARE COLORS === */
  --org-context: 262 83% 58%;                /* Primary for org indicators */
  --org-isolation: 160 84% 39%;              /* Green for security indicators */
  --org-collaboration: 217 91% 60%;          /* Blue for team features */
  --org-switching: 262 83% 90%;              /* Light purple for context changes */
  
  /* === CRM-SPECIFIC COLORS === */
  --pipeline-lead: 220 9% 46%;               /* Gray - New leads */
  --pipeline-contact: 217 91% 60%;           /* Blue - In contact */
  --pipeline-proposal: 43 96% 56%;           /* Yellow - Proposal sent */
  --pipeline-negotiation: 25 95% 53%;        /* Orange - Negotiating */
  --pipeline-closed: 160 84% 39%;            /* Green - Closed won */
  
  /* === COMMUNICATION CHANNELS === */
  --whatsapp: 142 76% 36%;                   /* Official WhatsApp green */
  --whatsapp-light: 142 76% 96%;             /* Light green backgrounds */
  --email: 217 91% 60%;                      /* Blue for email */
  --voip: 262 83% 58%;                       /* Primary for VoIP calls */
  --note: 220 9% 46%;                        /* Gray for manual notes */
  
  /* === AI FEATURES === */
  --ai-primary: 262 83% 58%;                 /* Primary for AI indicators */
  --ai-success: 160 84% 39%;                 /* Green for successful AI operations */
  --ai-processing: 43 96% 56%;               /* Yellow for AI processing */
  --ai-background: 262 83% 97%;              /* Very light purple for AI content */
}

/* Dark Mode Variants */
.dark {
  --primary: 262 83% 67%;                    /* Lighter purple for dark backgrounds */
  --primary-foreground: 224 71% 4%;          /* Dark text on light purple */
  --org-context: 262 83% 67%;                /* Adjusted for dark mode */
  --ai-background: 262 83% 8%;               /* Dark purple for AI content */
}
```

### **2.3 Organization-Aware UI Patterns**

**Multi-Tenancy Visual Language:**

```typescript
// Organization Context Display Patterns
organizationPatterns: {
  headerContext: {
    component: "Organization name + logo always visible",
    position: "Top-left header with clear hierarchy",
    elements: [
      "Agency name (truncated if long)",
      "Agency logo/avatar", 
      "User role badge (Owner/Admin/Member)",
      "Team size indicator (e.g., '8 members')",
      "Subscription tier badge"
    ],
    interaction: "Click to open organization switcher"
  },
  
  organizationSwitcher: {
    trigger: "Agency name in header",
    design: "Dropdown with search for agencies with many orgs",
    content: [
      "List of accessible agencies",
      "Role in each agency",
      "Last activity timestamp",
      "Visual separator for current agency"
    ],
    performance: "< 200ms switching time",
    security: "Complete data isolation verification"
  },
  
  dataIsolationIndicators: {
    purpose: "Visual confirmation of data security",
    indicators: [
      "Subtle org-colored borders on data containers",
      "Org badge on sensitive data components",
      "Security shield icons for multi-org users",
      "Agency name watermarks on reports/exports"
    ]
  },
  
  teamCollaboration: {
    activeIndicators: "Who's online from the agency team",
    activityFeed: "Recent team actions within organization",
    shareControls: "Org-scoped sharing permissions",
    notifications: "Team-aware notification badges"
  }
}
```

### **2.4 B2B-Specific Interface Guidelines**

**Professional Interface Standards:**

```typescript
// B2B Interface Principles for Agencies
b2bInterfaceGuidelines: {
  professionalTone: {
    language: "Casual-professional Brazilian Portuguese",
    messaging: "Direct, warm, competent without being cold",
    errorMessages: "Helpful, solution-oriented, not intimidating",
    emptyStates: "Encouraging with clear next actions"
  },
  
  informationDensity: {
    principle: "Progressive disclosure - start simple, reveal complexity",
    dashboard: "Essential metrics prominent, details on demand",
    tables: "Compact but readable, sortable/filterable",
    forms: "Logical grouping with clear sections"
  },
  
  workflowOptimization: {
    keyboardShortcuts: "Common actions keyboard accessible",
    batchOperations: "Multi-select for bulk actions",
    quickActions: "Context menus for common tasks",
    autoSave: "Frequent auto-save with visual confirmation"
  },
  
  agencySpecificUX: {
    clientFocus: "Client-centric information architecture",
    projectContext: "Project/campaign context always visible",
    timeTracking: "Time-aware interfaces (deadlines, schedules)",
    performanceMetrics: "Agency KPIs prominently displayed"
  }
}
```

## **PHASE 3: INTERFACE DESIGN**

### **3.1 Landing Page Design (Based on 08-landing-page.md)**

**Conversion-Optimized Landing Page:**

```typescript
// Landing Page Interface Specification
landingPageDesign: {
  hero: {
    layout: "Full-width with centered content, max-w-7xl container",
    headline: {
      typography: "text-4xl md:text-6xl font-bold leading-tight",
      color: "text-foreground with text-primary accent on key phrases",
      content: "O Único CRM que Agências Digitais Brasileiras Realmente Precisam"
    },
    
    subheadline: {
      typography: "text-xl leading-relaxed max-w-3xl mx-auto",
      color: "text-muted-foreground", 
      content: "Pipeline visual + WhatsApp integrado + IA em português"
    },
    
    ctaButtons: {
      primary: {
        text: "Criar Organização Grátis",
        style: "Button size='lg' className='h-14 px-8 bg-primary hover:bg-primary/90'",
        tracking: "gtag('event', 'cta_primary_click', {cta_position: 'hero'})"
      },
      secondary: {
        text: "Ver Demonstração",
        style: "Button variant='outline' size='lg' className='h-14 px-8 border-primary text-primary'"
      }
    },
    
    heroVisual: {
      mockup: "Dashboard screenshot with org context visible",
      annotations: [
        "Pipeline Kanban highlight overlay",
        "WhatsApp integration indicator",
        "AI summary component showcase",
        "Organization switcher demonstration"
      ]
    }
  },
  
  problemSolution: {
    problemCards: [
      {
        title: "WhatsApp Desorganizado",
        description: "Conversas importantes se perdem",
        icon: "MessageSquare",
        style: "Card className='p-6 bg-red-50 border-red-200'"
      },
      {
        title: "Planilhas Caóticas", 
        description: "Leads espalhados em planilhas",
        icon: "FileSpreadsheet"
      },
      {
        title: "Equipe Desalinhada",
        description: "Falta visibilidade entre membros",
        icon: "Users"
      }
    ],
    
    solutionCards: [
      {
        title: "Pipeline Visual Especializado",
        description: "5 estágios otimizados para agências",
        icon: "BarChart3",
        style: "Card className='p-6 bg-violet-50 border-violet-200'"
      },
      {
        title: "WhatsApp Business Integrado",
        description: "Histórico completo organizado",
        icon: "Smartphone",
        style: "Card className='p-6 bg-green-50 border-green-200'"
      },
      {
        title: "IA que Fala Português",
        description: "Resumos automáticos inteligentes",
        icon: "Sparkles",
        style: "Card className='p-6 bg-blue-50 border-blue-200'"
      }
    ]
  },
  
  socialProof: {
    testimonials: [
      {
        quote: "Loved CRM economizou 15 horas/semana da nossa equipe",
        author: "Carlos Silva - Silva Digital Marketing",
        metrics: "↑ 300% eficiência",
        component: "Card className='p-8 bg-white shadow-md'"
      }
    ],
    
    metricsGrid: [
      { value: "500+", label: "Agências Ativas" },
      { value: "2.500+", label: "Membros de Equipe" },
      { value: "98%", label: "Taxa de Adoção" },
      { value: "4.9/5", label: "Satisfação NPS" }
    ]
  },
  
  pricing: {
    tiers: [
      {
        name: "Starter",
        price: "R$ 0",
        description: "Perfeito para agências começando",
        highlight: false,
        features: ["1 organização", "Até 3 membros", "100 leads/mês"]
      },
      {
        name: "Professional",
        price: "R$ 197",
        description: "Ideal para agências de 5-15 pessoas",
        highlight: true,
        badge: "⭐ Recomendado",
        features: ["Organizações ilimitadas", "Até 15 membros", "WhatsApp Business API"]
      },
      {
        name: "Enterprise", 
        price: "R$ 397",
        description: "Para agências grandes e networks",
        highlight: false,
        features: ["Membros ilimitados", "SSO", "API customizada"]
      }
    ]
  }
}
```

### **3.2 CRM Dashboard and Pipeline Interfaces**

**Main Dashboard Design:**

```typescript
// CRM Dashboard Interface Specification
dashboardDesign: {
  layout: {
    structure: "Header + Sidebar + Main Content + Org Context Panel",
    responsive: "Collapsible sidebar on mobile, bottom navigation",
    spacing: "Consistent 1rem (16px) spacing system"
  },
  
  header: {
    height: "64px fixed height",
    background: "bg-background border-b border-border",
    content: [
      {
        position: "left",
        component: "OrganizationSwitcher + current agency context",
        style: "flex items-center gap-4 px-6"
      },
      {
        position: "center", 
        component: "Search command palette (⌘K)",
        style: "max-w-md w-full"
      },
      {
        position: "right",
        component: "Notifications + User menu + theme switcher",
        style: "flex items-center gap-2 px-6"
      }
    ]
  },
  
  sidebar: {
    width: "240px desktop, collapsible on mobile",
    navigation: [
      {
        section: "Core CRM",
        items: [
          { label: "Dashboard", icon: "LayoutDashboard", href: "/admin/dashboard" },
          { label: "Pipeline", icon: "Kanban", href: "/admin/pipeline" },
          { label: "Clientes", icon: "Users", href: "/admin/clients" },
          { label: "Timeline", icon: "Clock", href: "/admin/timeline" }
        ]
      },
      {
        section: "Comunicação",
        items: [
          { label: "WhatsApp", icon: "MessageCircle", href: "/admin/whatsapp" },
          { label: "Email", icon: "Mail", href: "/admin/email" },
          { label: "Chamadas", icon: "Phone", href: "/admin/voip" }
        ]
      },
      {
        section: "IA & Insights",
        items: [
          { label: "Resumos IA", icon: "Sparkles", href: "/admin/ai-summaries" },
          { label: "Relatórios", icon: "BarChart3", href: "/admin/reports" }
        ]
      },
      {
        section: "Configurações",
        items: [
          { label: "Equipe", icon: "Users", href: "/admin/team" },
          { label: "Integrações", icon: "Zap", href: "/admin/integrations" },
          { label: "Configurações", icon: "Settings", href: "/admin/settings" }
        ]
      }
    ]
  },
  
  mainContent: {
    padding: "p-6",
    maxWidth: "No max-width - utilize full space",
    scrollable: "Vertical scroll with proper boundaries"
  }
}
```

**Pipeline Kanban Interface:**

```typescript
// Pipeline Kanban Design Specification
pipelineKanbanDesign: {
  layout: {
    structure: "5-column horizontal scrolling Kanban",
    columns: ["Lead", "Contato", "Proposta", "Negociação", "Fechado"],
    columnWidth: "320px fixed width per column",
    spacing: "gap-4 between columns"
  },
  
  columnDesign: {
    header: {
      content: "Stage name + count + add button",
      style: "p-4 bg-muted/50 rounded-t-lg border-b",
      addButton: "Button size='sm' variant='ghost' className='ml-auto'"
    },
    
    body: {
      style: "min-h-[600px] p-4 bg-background rounded-b-lg border",
      scrollable: "Vertical scroll within column",
      dropZone: "Visual drop indicators during drag"
    },
    
    stageColors: {
      lead: "bg-gray-50 border-gray-200",
      contact: "bg-blue-50 border-blue-200",
      proposal: "bg-yellow-50 border-yellow-200", 
      negotiation: "bg-orange-50 border-orange-200",
      closed: "bg-emerald-50 border-emerald-200"
    }
  },
  
  leadCard: {
    structure: "Draggable card with lead information",
    height: "Variable height based on content",
    style: "Card className='mb-3 cursor-grab hover:shadow-md transition-shadow'",
    
    content: [
      {
        section: "header",
        elements: ["Lead/client name", "Company", "Value indicator"]
      },
      {
        section: "body", 
        elements: ["Contact info", "Source", "Last activity"]
      },
      {
        section: "footer",
        elements: ["Assigned team member", "Priority badge", "Action menu"]
      }
    ],
    
    interactions: {
      drag: "Smooth drag with visual feedback",
      hover: "Hover card with detailed information",
      click: "Opens lead detail drawer/modal"
    }
  },
  
  dragAndDrop: {
    library: "dnd-kit or react-beautiful-dnd",
    feedback: "Visual drag state + drop indicators",
    validation: "Prevent invalid stage transitions",
    optimistic: "Immediate UI update + rollback on API failure"
  }
}
```

### **3.3 Timeline Communication Views**

**Unified Timeline Interface:**

```typescript
// Timeline Communication Design Specification
timelineDesign: {
  layout: {
    structure: "Chronological feed with channel indicators",
    grouping: "Group by day with clear date dividers",
    filtering: "Channel filters + date range + search",
    pagination: "Infinite scroll with performance optimization"
  },
  
  timelineEntry: {
    structure: "Card with channel icon + content + metadata",
    style: "Card className='mb-4 p-4 relative border-l-4'",
    
    channelIndicators: {
      whatsapp: {
        borderColor: "border-l-whatsapp",
        icon: "MessageCircle className='text-whatsapp'",
        background: "bg-whatsapp-light"
      },
      email: {
        borderColor: "border-l-blue-500",
        icon: "Mail className='text-blue-500'", 
        background: "bg-blue-50"
      },
      voip: {
        borderColor: "border-l-primary",
        icon: "Phone className='text-primary'",
        background: "bg-violet-50"
      },
      note: {
        borderColor: "border-l-gray-500", 
        icon: "StickyNote className='text-gray-500'",
        background: "bg-gray-50"
      }
    },
    
    content: {
      header: [
        "Channel type + timestamp",
        "Participant(s) info",
        "Status indicators (sent/delivered/read)"
      ],
      body: [
        "Message content or call summary",
        "Attachments or recordings",
        "AI-generated insights if available"
      ],
      footer: [
        "Team member responsible",
        "Actions menu (reply, forward, note)",
        "Link to original conversation"
      ]
    }
  },
  
  aiSummaryIntegration: {
    trigger: "Automatic for conversations > 10 messages",
    display: {
      style: "Card className='bg-ai-background border-ai-primary p-4 rounded-xl'",
      header: "Sparkles icon + 'Resumo com IA' + confidence score",
      content: "Formatted summary with key insights",
      actions: ["Edit summary", "Regenerate", "Share with team"]
    }
  },
  
  realTimeUpdates: {
    newMessages: "Live updates with smooth animations",
    typingIndicators: "Show when team members are responding",
    readStatus: "Team member read indicators",
    notifications: "In-app notifications for priority messages"
  }
}
```

### **3.4 Mobile-First Responsive Specifications**

**Mobile Interface Adaptations:**

```typescript
// Mobile-First Responsive Design
responsiveDesign: {
  breakpoints: {
    mobile: "320px - 768px", 
    tablet: "768px - 1024px",
    desktop: "1024px+"
  },
  
  mobileOptimizations: {
    navigation: {
      structure: "Bottom tab bar + collapsible top header",
      tabs: ["Dashboard", "Pipeline", "Timeline", "Clientes", "Mais"],
      behavior: "Fixed position bottom navigation"
    },
    
    pipelineKanban: {
      adaptation: "Horizontal swipe between stages",
      stageView: "One stage at a time with stage indicator dots",
      cardInteraction: "Tap to view details, hold to drag",
      addLead: "Floating action button"
    },
    
    timeline: {
      adaptation: "Full-width cards with expanded touch targets", 
      channelFilters: "Horizontal scrolling filter chips",
      messageActions: "Swipe gestures for quick actions",
      aiSummary: "Expandable/collapsible sections"
    },
    
    organizationSwitcher: {
      adaptation: "Full-screen modal on mobile",
      searchable: "Large search input with auto-complete",
      visualization: "Agency cards with clear visual hierarchy"
    }
  },
  
  touchOptimizations: {
    minimumTouchTarget: "44px minimum touch target size",
    gestureSupport: "Swipe navigation between sections",
    pullToRefresh: "Standard pull-to-refresh pattern",
    hapticFeedback: "Subtle haptic feedback for drag/drop"
  },
  
  performanceConsiderations: {
    imageOptimization: "Responsive images with next/image",
    lazyLoading: "Intersection observer for timeline",
    cacheStrategy: "Aggressive caching for frequently accessed data",
    offlineSupport: "Service worker for basic offline functionality"
  }
}
```

## **PHASE 4: ACCESSIBILITY & USABILITY**

### **4.1 WCAG 2.1 AA Compliance Specifications**

**Accessibility Implementation:**

```typescript
// WCAG 2.1 AA Compliance Specification
accessibilityCompliance: {
  colorContrast: {
    minimumRatio: "4.5:1 for normal text, 3:1 for large text",
    verification: [
      "Primary (#8B5CF6) on white: 4.52:1 ✓",
      "Text on primary backgrounds: 7.1:1 ✓", 
      "Muted text: 4.89:1 ✓",
      "All accent colors meet AA standards ✓"
    ],
    darkMode: "All ratios maintained in dark mode variant"
  },
  
  keyboardNavigation: {
    focusManagement: "Logical tab order throughout interfaces",
    focusIndicators: "Prominent focus rings with primary color",
    skipLinks: "Skip to main content and navigation",
    shortcuts: [
      "⌘K - Command palette",
      "⌘/ - Search",
      "⌘1-5 - Pipeline stages",
      "Esc - Close modals/drawers"
    ]
  },
  
  screenReader: {
    semanticMarkup: "Proper heading hierarchy (h1-h6)",
    ariaLabels: "Comprehensive aria-label and aria-describedby",
    liveRegions: "aria-live for dynamic content updates",
    roleAttributes: "Proper ARIA roles for custom components"
  },
  
  organizationAccessibility: {
    contextAnnouncement: "Screen reader announcement on org switch",
    roleIndication: "Clear role indicators for team members",
    permissionFeedback: "Accessible feedback for restricted actions",
    dataIsolationClarity: "Clear indication of data boundaries"
  }
}
```

### **4.2 Brazilian Market Localization Considerations**

**Cultural and Linguistic Adaptations:**

```typescript
// Brazilian Localization Specification  
brazilianLocalization: {
  language: {
    tone: "Casual-professional Brazilian Portuguese",
    formality: "Você (informal) vs Senhor/Senhora (when appropriate)",
    regionalisms: "Neutral Brazilian terms, avoid extreme regionalisms",
    businessTerms: "Standard business terminology familiar to agencies"
  },
  
  culturalAdaptations: {
    colorAssociations: "Green for success (strong positive), Red for alerts",
    businessHours: "Brazilian business hour defaults (9h-18h)",
    phoneNumbers: "Brazilian phone number format (+55 11 99999-9999)",
    currency: "Real (R$) formatting with proper placement"
  },
  
  communicationPreferences: {
    whatsappFirst: "WhatsApp as primary communication channel",
    informalityComfort: "Comfortable with casual business communication", 
    visualCommunication: "High preference for visual/emoji communication",
    groupDiscussion: "Team-oriented decision making patterns"
  },
  
  legalCompliance: {
    lgpd: "LGPD compliance indicators and opt-ins",
    businessRegistration: "CNPJ field formats and validation",
    taxInformation: "Brazilian tax information handling",
    dataLocality: "Data residency awareness"
  }
}
```

### **4.3 Performance Optimization Guidelines**

**Performance Standards:**

```typescript
// Performance Optimization Specification
performanceStandards: {
  loadingTimes: {
    initialPageLoad: "< 2s first contentful paint",
    organizationSwitch: "< 200ms context switching",
    pipelineDragDrop: "< 16ms for 60fps interactions", 
    timelineScroll: "< 100ms for smooth scrolling",
    aiSummaryGeneration: "< 3s with progress indicator"
  },
  
  coreWebVitals: {
    lcp: "< 2.5s Largest Contentful Paint",
    fid: "< 100ms First Input Delay",
    cls: "< 0.1 Cumulative Layout Shift"
  },
  
  optimizationStrategies: {
    codesplitting: "Route-based code splitting with Next.js",
    imageOptimization: "WebP format with responsive sizes",
    bundleSize: "< 250KB initial JavaScript bundle",
    apiOptimization: "GraphQL or efficient REST with pagination",
    caching: "Aggressive caching for org-scoped data"
  },
  
  mobilePerformance: {
    networkOptimization: "Optimize for 3G networks common in Brazil",
    batteryConsideration: "Minimize background processing",
    dataUsage: "Efficient data usage for prepaid mobile plans",
    offlineGraceful: "Graceful degradation when offline"
  }
}
```

### **4.4 Cross-Browser Compatibility Matrix**

**Browser Support Specification:**

```typescript
// Cross-Browser Compatibility Matrix
browserSupport: {
  primary: {
    chrome: "Latest 2 versions (90%+ Brazilian market share)",
    safari: "Latest 2 versions (mobile Safari important)",
    firefox: "Latest 2 versions", 
    edge: "Latest 2 versions"
  },
  
  mobile: {
    mobileSafari: "iOS 14+ (iPhone users)",
    chromeAndroid: "Android 8+ (majority market)",
    samsung: "Samsung Internet latest versions"
  },
  
  testing: {
    automated: "Playwright cross-browser testing",
    manual: "BrowserStack for device testing",
    performance: "Lighthouse CI for all supported browsers"
  },
  
  gracefulDegradation: {
    css: "Progressive enhancement for advanced CSS features",
    javascript: "Essential functionality without modern JS",
    webp: "JPEG fallbacks for WebP images",
    animations: "Respect prefers-reduced-motion"
  }
}
```

## **PHASE 5: IMPLEMENTATION GUIDELINES**

### **5.1 Next.js 14 + TypeScript Integration Patterns**

**React Implementation Standards:**

```typescript
// React Component Implementation Patterns
implementationPatterns: {
  componentStructure: {
    // Organization-aware component template
    template: `
    import { useOrgContext } from '@/hooks/use-org-context'
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
    
    interface ComponentProps {
      // TypeScript props with org context awareness
    }
    
    export function Component({ ...props }: ComponentProps) {
      const { organization, user } = useOrgContext()
      
      // Organization-scoped logic
      return (
        <Card className="org-scoped-card">
          <CardHeader>
            <CardTitle>{organization?.name} Context</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Org-isolated content */}
          </CardContent>
        </Card>
      )
    }`,
    
    conventions: [
      "Always use TypeScript interfaces for props",
      "Include useOrgContext when dealing with org data",
      "Implement error boundaries for org-scoped components",
      "Use shadcn/ui components as building blocks"
    ]
  },
  
  stateManagement: {
    orgContext: "useOrgContext hook for organization state",
    serverState: "TanStack Query for server state + caching",
    clientState: "Zustand for client-side state management",
    formState: "react-hook-form + zod validation"
  },
  
  dataFetching: {
    pattern: "Server Components where possible, Client Components for interactivity",
    apiCalls: "BaseService with automatic X-Org-Id headers",
    errorHandling: "Consistent error boundaries with org context",
    loading: "Skeleton components during loading states"
  }
}
```

### **5.2 Tailwind CSS Custom Configurations**

**Tailwind Configuration Extensions:**

```javascript
// tailwind.config.js - Custom Configuration
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Loved CRM Custom Colors
      colors: {
        // Primary brand colors
        primary: {
          50: 'hsl(262, 83%, 97%)',
          100: 'hsl(262, 83%, 95%)', 
          500: 'hsl(262, 83%, 58%)', // Main Loved Purple
          600: 'hsl(262, 83%, 48%)',
          900: 'hsl(262, 83%, 28%)'
        },
        
        // Organization context colors
        'org-context': 'hsl(262, 83%, 58%)',
        'org-isolation': 'hsl(160, 84%, 39%)',
        'org-collaboration': 'hsl(217, 91%, 60%)',
        
        // Pipeline stage colors
        'pipeline-lead': 'hsl(220, 9%, 46%)',
        'pipeline-contact': 'hsl(217, 91%, 60%)',
        'pipeline-proposal': 'hsl(43, 96%, 56%)',
        'pipeline-negotiation': 'hsl(25, 95%, 53%)',
        'pipeline-closed': 'hsl(160, 84%, 39%)',
        
        // Communication channels
        whatsapp: {
          DEFAULT: 'hsl(142, 76%, 36%)',
          light: 'hsl(142, 76%, 96%)',
          dark: 'hsl(142, 82%, 17%)'
        },
        
        // AI features
        'ai-primary': 'hsl(262, 83%, 58%)',
        'ai-background': 'hsl(262, 83%, 97%)',
        'ai-processing': 'hsl(43, 96%, 56%)'
      },
      
      // Custom spacing for org components
      spacing: {
        'org-card': '1rem',
        'pipeline-column': '20rem',
        'timeline-indent': '3rem'
      },
      
      // Custom border radius
      borderRadius: {
        'org-card': '0.75rem',
        'pipeline-card': '0.5rem'
      },
      
      // Custom animations
      animation: {
        'org-switch': 'orgSwitch 200ms ease-out',
        'ai-pulse': 'aiPulse 2s ease-in-out infinite',
        'pipeline-drag': 'pipelineDrag 150ms ease-out'
      },
      
      keyframes: {
        orgSwitch: {
          '0%': { opacity: '0', transform: 'translateY(-4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        aiPulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate')
  ]
}
```

### **5.3 Component Development Standards**

**Component Architecture:**

```typescript
// Component Development Standards
componentStandards: {
  folderStructure: {
    ui: "shadcn/ui components (do not modify directly)",
    common: "Reusable components across features",
    crm: "CRM-specific components",
    layouts: "Layout and shell components",
    forms: "Form-specific components"
  },
  
  namingConventions: {
    components: "PascalCase (e.g., OrganizationSwitcher)",
    props: "camelCase interfaces (e.g., OrganizationSwitcherProps)",
    handlers: "handle prefix (e.g., handleOrgSwitch)",
    constants: "SCREAMING_SNAKE_CASE"
  },
  
  documentationStandards: {
    storybook: "Component stories for design system documentation",
    jsdoc: "TSDoc comments for complex components",
    examples: "Usage examples in component files",
    accessibility: "A11y notes in component documentation"
  },
  
  testingStandards: {
    unit: "Vitest for component unit tests",
    integration: "Testing Library for integration tests",
    visual: "Chromatic for visual regression tests",
    accessibility: "axe-core for a11y testing"
  }
}
```

### **5.4 Testing and Validation Procedures**

**Comprehensive Testing Strategy:**

```typescript
// Testing and Validation Specification
testingStrategy: {
  componentTesting: {
    unit: {
      framework: "Vitest + Testing Library",
      coverage: "> 80% line coverage for UI components",
      focus: [
        "Organization context handling",
        "Props validation and defaults", 
        "Event handlers and callbacks",
        "Conditional rendering logic"
      ]
    },
    
    visual: {
      tool: "Chromatic + Storybook",
      scope: "All major component variations",
      scenarios: [
        "Different organization contexts",
        "Various data states (loading, error, empty)",
        "Light and dark mode variants",
        "Mobile and desktop viewports"
      ]
    }
  },
  
  accessibilityTesting: {
    automated: {
      tool: "axe-core + jest-axe",
      integration: "Run on every component test",
      coverage: "WCAG 2.1 AA compliance verification"
    },
    
    manual: {
      keyboardNavigation: "Complete keyboard navigation testing",
      screenReader: "Screen reader compatibility testing",
      colorContrast: "Manual color contrast verification"
    }
  },
  
  organizationIsolationTesting: {
    crossOrgPrevention: [
      "Attempt to access other organization's data",
      "Verify proper header validation", 
      "Test organization switching boundaries",
      "Validate data filtering in components"
    ],
    
    performanceTesting: [
      "Organization switching speed",
      "Large dataset rendering",
      "Drag and drop performance",
      "Mobile touch response"
    ]
  },
  
  e2eTesting: {
    framework: "Playwright",
    criticalPaths: [
      "Landing page to signup conversion",
      "Organization creation and setup",
      "Team member invitation flow",
      "Pipeline lead management", 
      "WhatsApp integration setup",
      "AI summary generation"
    ],
    
    crossBrowser: "Chrome, Safari, Firefox, Edge testing",
    devices: "Desktop, tablet, mobile device testing"
  }
}
```

## **IMPLEMENTATION ROADMAP**

### **Phase 1: Design System Foundation (Week 1-2)**

```typescript
phase1: {
  designTokens: [
    "Implement Loved Purple color system",
    "Configure shadcn/ui theme extensions",
    "Set up responsive breakpoints",
    "Create organization-aware CSS custom properties"
  ],
  
  coreComponents: [
    "OrganizationSwitcher component",
    "OrgContextIndicator component", 
    "TeamMemberAvatar component",
    "FeatureGate component with tier logic"
  ],
  
  layouts: [
    "Main dashboard layout with sidebar",
    "Mobile-responsive navigation",
    "Header with org context display",
    "Landing page layout structure"
  ]
}
```

### **Phase 2: CRM Interface Implementation (Week 3-4)**

```typescript
phase2: {
  pipelineKanban: [
    "Drag and drop Kanban board",
    "Lead cards with org-scoped data",
    "Stage transition animations",
    "Mobile-friendly pipeline view"
  ],
  
  timelineCommunication: [
    "Unified timeline component",
    "Channel-specific message rendering",
    "Real-time updates integration",
    "WhatsApp message formatting"
  ],
  
  aiIntegration: [
    "AI summary display component",
    "Processing state indicators",
    "Confidence score visualization",
    "Edit/regenerate functionality"
  ]
}
```

### **Phase 3: Polish and Optimization (Week 5-6)**

```typescript
phase3: {
  performance: [
    "Code splitting optimization",
    "Image optimization implementation", 
    "Caching strategy deployment",
    "Bundle size optimization"
  ],
  
  accessibility: [
    "Complete WCAG 2.1 AA compliance",
    "Screen reader optimization",
    "Keyboard navigation refinement",
    "Color contrast validation"
  ],
  
  testing: [
    "Comprehensive test suite completion",
    "Cross-browser compatibility testing",
    "Performance benchmarking",
    "User acceptance testing"
  ]
}
```

## **QUALITY ASSURANCE CHECKLIST**

### **Pre-Launch Validation:**

- [ ] **Design System Compliance**: All components use shadcn/ui patterns + Loved Purple tokens
- [ ] **Organization Isolation**: Visual indicators for org context + data boundaries clear
- [ ] **Mobile-First Responsive**: Perfect mobile experience + progressive enhancement
- [ ] **WCAG 2.1 AA Compliance**: Full accessibility verification + keyboard navigation
- [ ] **Performance Standards**: Core Web Vitals met + < 200ms org switching
- [ ] **Cross-Browser Compatibility**: Tested on all supported browsers + devices
- [ ] **Brazilian Localization**: Portuguese language + cultural adaptations + LGPD compliance
- [ ] **Multi-Tenant Security**: Organization data isolation visual indicators + secure context switching

## **CONCLUSION**

This UI/UX design specification provides a comprehensive blueprint for implementing the Loved CRM system with:

1. **Complete Organization-Centric Design**: Every interface element respects multi-tenant boundaries with clear visual indicators
2. **100% shadcn/ui Compatibility**: Built on proven component patterns with custom Loved Purple theming
3. **Mobile-First Brazilian Market Focus**: Optimized for smartphone-heavy usage patterns with WhatsApp-first communication
4. **Accessibility Excellence**: WCAG 2.1 AA compliant with comprehensive keyboard and screen reader support
5. **Performance-Optimized**: Sub-200ms organization switching with excellent Core Web Vitals scores

The design system successfully positions Loved CRM as the premier choice for Brazilian digital agencies through thoughtful user experience design, technical excellence, and cultural adaptation while maintaining complete data security through visual organization isolation indicators.

**Implementation Priority**: Core organization-aware components → CRM-specific interfaces → Mobile optimizations → Accessibility polish → Performance optimization

**Success Metrics**: 95% WCAG compliance, < 200ms org switching, > 8.5 NPS satisfaction score, 100% organization data isolation verification