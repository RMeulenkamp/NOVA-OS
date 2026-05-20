import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

export const metadata: Metadata = {
  title: 'NOVA OS — Your Nervous System Companion',
  description:
    'An adaptive energy and nervous system companion for ambitious people. Understand your state, regulate in real time, and build consistent energy.',
  keywords: ['energy', 'nervous system', 'focus', 'wellness', 'NOVA Method'],
  authors: [{ name: 'NOVA Method' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#080827',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-nova-bg text-nova-text antialiased">
        <AuthProvider>
          {/* Energy lines background — fixed behind everything */}
          <div className="nova-energy-bg" aria-hidden="true" />
          <div className="nova-glow-overlay" aria-hidden="true" />
          {/* All content above bg */}
          <div className="nova-page min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
