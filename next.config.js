const { withSentryConfig } = require('@sentry/nextjs')
const withNextIntl = require('next-intl/plugin')('./lib/i18n/config.ts')

/** @type {import('next').NextConfig} */
const nextConfig = withNextIntl({
  // =====================================================
  // 🚂 RAILWAY PRODUCTION CONFIGURATION
  // =====================================================

  // Enable standalone build for Docker optimization
  output: 'standalone',

  rewrites: async () => {
    console.log('Next.js rewrites loading...')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)

    // Railway: Get backend URL for rewrites
    // CRITICAL: Use NEXT_PUBLIC_API_URL which contains backend URL
    const backendUrl =
      process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_API_URL
        : 'http://192.168.2.111:8000'

    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
      console.error('NEXT_PUBLIC_API_URL is required in production!')
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required')
    }

    const rules = [
      // ====================================================================
      // 🚨 CRITICAL: ADD NEW API ROUTES HERE - BEFORE GENERIC /api/:path* 
      // ====================================================================
      // IMPORTANT: More specific rules FIRST!
      {
        source: '/api/auth/:path*',
        destination: `${backendUrl}/auth/:path*`,
      },
      {
        source: '/api/users/:path*',
        destination: `${backendUrl}/users/:path*`,
      },
      {
        source: '/api/organizations/:path*',
        destination: `${backendUrl}/organizations/:path*`,
      },
      {
        source: '/api/members/:path*',
        destination: `${backendUrl}/members/:path*`,
      },
      {
        source: '/api/billing/:path*',
        destination: `${backendUrl}/billing/:path*`,
      },
      {
        source: '/api/crm/leads/:path*',
        destination: `${backendUrl}/crm/leads/:path*`,
      },
      {
        source: '/api/crm/communications/:path*',
        destination: `${backendUrl}/crm/communications/:path*`,
      },
      {
        source: '/api/crm/ai-summaries/:path*',
        destination: `${backendUrl}/crm/ai-summaries/:path*`,
      },
      {
        source: '/api/integrations/:path*',
        destination: `${backendUrl}/integrations/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${backendUrl}/admin/:path*`,
      },
      // ====================================================================
      // 🚨 ADD NEW ROUTES ABOVE THIS LINE - NOT BELOW!
      // ====================================================================
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`,
      },
      {
        source: '/docs',
        destination: `${backendUrl}/docs`,
      },
      {
        source: '/openapi.json',
        destination: `${backendUrl}/openapi.json`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
      },
    ]

    console.log('🚂 Railway Backend URL:', backendUrl)
    console.log('🚂 Rewrite rules:', JSON.stringify(rules, null, 2))
    return rules
  },

  // Otimizações para produção
  compress: true,
  poweredByHeader: false,

  // Ignore TypeScript errors during build para MVP
  typescript: {
    ignoreBuildErrors: true,
  },

  // Ignore ESLint errors during build para MVP
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Para MVP: disable static export em páginas com useSearchParams
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Image domains configuration for external images
  images: {
    domains: [
      'images.unsplash.com',
      'upload.wikimedia.org',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/photo-*',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/commons/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Headers de segurança
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ]
  },
})

// 🔍 Sentry configuration
const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs

  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

// Make sure adding Sentry options is the last code to run before exporting
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig
