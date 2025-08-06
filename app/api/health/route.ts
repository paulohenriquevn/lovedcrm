// =====================================================
// 🚂 RAILWAY FRONTEND HEALTH CHECK ENDPOINT
// =====================================================
// Next.js API route for Railway health monitoring

import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check - can be extended
    const healthData = {
      status: 'healthy',
      service: 'frontend',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      // Railway-specific info
      railway: {
        service_name: process.env.RAILWAY_SERVICE_NAME || 'frontend',
        environment: process.env.RAILWAY_ENVIRONMENT || 'unknown',
        deployment_id: process.env.RAILWAY_DEPLOYMENT_ID || 'unknown',
      },
      // Backend connectivity check (optional)
      backend_url: process.env.NEXT_PUBLIC_API_URL || 'not-configured',
    }

    // Optional: Test backend connectivity
    if (process.env.NEXT_PUBLIC_API_URL) {
      try {
        const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Short timeout for health checks
          signal: AbortSignal.timeout(5000),
        })

        if (backendResponse.ok) {
          const backendHealth = await backendResponse.json()
          healthData.backend = {
            status: backendHealth.status || 'unknown',
            reachable: true,
          }
        } else {
          healthData.backend = {
            status: 'unreachable',
            reachable: false,
            http_code: backendResponse.status,
          }
        }
      } catch (error) {
        healthData.backend = {
          status: 'error',
          reachable: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    }

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        service: 'frontend',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
