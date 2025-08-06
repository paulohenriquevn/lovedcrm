export const env = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || '',
} as const

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    ME: '/api/v1/auth/me',
    LOGOUT: '/api/v1/auth/logout',
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password',
    RESET_PASSWORD: '/api/v1/auth/reset-password',
    VERIFY_EMAIL: '/api/v1/auth/verify-email',
    GOOGLE_AUTHORIZE: '/api/v1/auth/google/authorize',
    GOOGLE_CALLBACK: '/api/v1/auth/google/callback',
  },

  // Users
  USERS: {
    ME: '/api/v1/users/me',
    LIST: '/api/v1/users',
    BY_ID: (id: string) => `/api/v1/users/${id}`,
  },

  // Organizations
  ORGANIZATIONS: {
    LIST: '/api/v1/organizations',
    CREATE: '/api/v1/organizations',
    BY_ID: (id: string) => `/api/v1/organizations/${id}`,
    MEMBERS: (id: string) => `/api/v1/organizations/${id}/members`,
    MEMBER_BY_ID: (orgId: string, userId: string) =>
      `/api/v1/organizations/${orgId}/members/${userId}`,
    LEAVE: (id: string) => `/api/v1/organizations/${id}/leave`,
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/api/v1/subscriptions/plans',
    BY_ORG_ID: (id: string) => `/api/v1/subscriptions/${id}`,
    CHECKOUT: '/api/v1/subscriptions/checkout',
    PORTAL: '/api/v1/subscriptions/portal',
    CANCEL: (id: string) => `/api/v1/subscriptions/${id}`,
    WEBHOOK: '/api/v1/subscriptions/webhooks/stripe',
  },
} as const
