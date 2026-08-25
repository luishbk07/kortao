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

const DESCRIPCION_SITIO =
  'Kortao es la plataforma de reservas online para barberías, salones y negocios de belleza. Configura servicios, horarios y recibe citas con notificaciones por WhatsApp y correo.'

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://kortao.com'
  ),
  title: {
    default: 'Kortao | Reservas online para barberías y salones',
    template: '%s | Kortao'
  },
  description: DESCRIPCION_SITIO,
  applicationName: 'Kortao',
  keywords: [
    'reservas online',
    'barbería',
    'salón de belleza',
    'citas',
    'agenda',
    'Kortao',
    'reservar cita'
  ],
  authors: [{ name: 'Kortao' }],
  creator: 'Kortao',
  publisher: 'Kortao',
  openGraph: {
    type: 'website',
    locale: 'es_DO',
    url: '/',
    siteName: 'Kortao',
    title: 'Kortao | Reservas online para barberías y salones',
    description: DESCRIPCION_SITIO,
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'Kortao'
      }
    ]
  },
  twitter: {
    card: 'summary',
    title: 'Kortao | Reservas online para barberías y salones',
    description: DESCRIPCION_SITIO,
    images: ['/icons/icon-512.png']
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kortao'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    // Google requires a square favicon that is a multiple of 48px.
    icon: [
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/icons/icon-48.png'
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
