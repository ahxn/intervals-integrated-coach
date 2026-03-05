import type { Metadata } from 'next'
import { SessionProvider } from 'next-auth/react'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Intervals Integrated Coach',
  description: 'AI-powered running coach with Intervals.icu integration',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-background text-foreground`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
