import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Intervals Integrated Coach',
  description: 'AI-powered running coach with Intervals.icu integration',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.className} bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
