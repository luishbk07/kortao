import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { RegistrarServiceWorker } from '@/presentation/components/ui/RegistrarServiceWorker'
import { ThemeRegistry } from '@/presentation/theme/ThemeRegistry'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Kortao',
  description: 'Reservas para barberías y salones',
  applicationName: 'Kortao',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kortao'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: '/icons/icon-192.png'
  },
  other: {
    'google-adsense-account': 'ca-pub-7362041124232949'
  }
}

export const viewport: Viewport = {
  themeColor: '#1F4B3F'
}

type RootLayoutProps = {
  children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang='es'>
      <body className={inter.variable}>
        <ThemeRegistry>
          {children}
          <RegistrarServiceWorker />
        </ThemeRegistry>
        <Script
          src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7362041124232949'
          strategy='afterInteractive'
          crossOrigin='anonymous'
        />
      </body>
    </html>
  )
}

export default RootLayout
