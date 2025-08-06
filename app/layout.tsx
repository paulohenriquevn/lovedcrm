import './globals.css'

import localFont from 'next/font/local'

import { ThemeProvider } from '@/components/providers/theme-provider'
import { Toaster as ShadcnToaster } from '@/components/ui/toaster'
import { cn } from '@/lib/utils'

import type { Metadata, Viewport } from 'next'

const geistSans = localFont({
  src: '../assets/geist.ttf',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: '../assets/geist-semibold.ttf',
  variable: '--font-geist-mono',
  weight: '100 900',
})
const SITE_TITLE = 'NextJS + FastAPI SaaS Starter'
const SITE_DESCRIPTION =
  'Complete SaaS starter with authentication, billing, multi-tenancy, and AI chat. Built with Next.js, FastAPI, and PostgreSQL.'

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: 'Complete SaaS starter with authentication, billing, multi-tenancy, and AI chat.',
    images: [
      {
        url: `/og?title=${SITE_TITLE}`,
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
    type: 'website',
    siteName: 'SaaS Starter',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: 'Complete SaaS starter with authentication, billing, multi-tenancy, and AI chat.',
    images: [
      {
        url: `/og?title=${SITE_TITLE}`,
        alt: SITE_TITLE,
      },
    ],
  },
  robots: 'index, follow',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          geistSans.variable,
          geistMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <ShadcnToaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
