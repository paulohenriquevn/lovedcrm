// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',

    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // You can remove this option if you're not planning to use the Sentry webpack plugin for uploading source maps.
    debug: process.env.NODE_ENV === 'development',

    // Only send errors in production to avoid development noise
    beforeSend: (event, hint) => {
      // In development, only send actual errors
      if (process.env.NODE_ENV === 'development') {
        if (event.level !== 'error') {
          return null
        }
      }

      // Remove sensitive data
      if (event.request?.headers) {
        delete event.request.headers['authorization']
        delete event.request.headers['cookie']
        delete event.request.headers['x-api-key']
      }

      if (event.extra) {
        // Remove any keys that might contain sensitive data
        const sensitiveKeys = ['password', 'token', 'secret', 'key', 'auth']
        Object.keys(event.extra).forEach(key => {
          if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
            delete event.extra![key]
          }
        })
      }

      return event
    },

    // Set tag defaults
    initialScope: {
      tags: {
        component: 'frontend-ssr',
        platform: 'nextjs-server',
      },
    },
  })
}
