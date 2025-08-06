/**
 * Tipos para faturamento e assinaturas - Integrados com backend real.
 */

// Plan data structure matching backend exactly
export interface Plan {
  id: string
  name: string
  slug: string
  price_cents: number
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

// Subscription data structure matching backend exactly
export interface Subscription {
  id: string
  organization_id: string
  plan: Plan
  stripe_subscription_id?: string | null
  stripe_customer_id?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Features response from backend
export interface FeaturesResponse {
  organization_id: string
  features: string[]
  plan_name: string | null
  plan_slug: string | null
}

// Plan comparison response from backend
export interface PlanComparisonResponse {
  plans: Plan[]
  current_plan_slug: string
  upgrade_available: boolean
  downgrade_available: boolean
}

// Upgrade request payload
export interface UpgradeRequest {
  plan_slug: string
}

// Downgrade request payload
export interface DowngradeRequest {
  confirm: boolean
  reason?: string
}

// Checkout session response
export interface CheckoutSessionResponse {
  checkout_url: string
  session_id: string
}

// Plan slugs from backend configuration (dynamic)
export enum PlanSlug {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  EXPERT = 'expert',
}

export interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string
  exp_month?: number
  exp_year?: number
  is_default: boolean
}

export interface Invoice {
  id: string
  amount: number
  currency: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  description?: string
  created_at: string
  due_date?: string
  paid_at?: string
  invoice_pdf?: string
}

export interface BillingPortalSession {
  url: string
}

export interface CheckoutSession {
  url: string
  session_id: string
}
