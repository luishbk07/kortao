import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import { RegistrarServiceWorker } from '@/presentation/components/ui/RegistrarServiceWorker'
import { ThemeRegistry } from '@/presentation/theme/ThemeRegistry'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const TITULO_SITIO =
  'Kortao — Agenda y reservas para tu negocio en República Dominicana'

const DESCRIPCION_SITIO =
  'Gestiona las citas de tu negocio y deja que tus clientes reserven online con un enlace. Recordatorios automáticos por WhatsApp y correo.'

const URL_SITIO = obtenerOrigenSitio()

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: TITULO_SITIO,
    template: '%s | Kortao'
  },
  description: DESCRIPCION_SITIO,
  applicationName: 'Kortao',
  authors: [{ name: 'Kortao' }],
  creator: 'Kortao',
  publisher: 'Kortao',
  openGraph: {
    type: 'website',
    locale: 'es_DO',
    url: URL_SITIO,
    siteName: 'Kortao',
    title: TITULO_SITIO,
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
    title: TITULO_SITIO,
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icons/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon.ico', sizes: '48x48' }
    ],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: [{ url: '/favicon.svg', type: 'image/svg+xml' }]
  },
  other: {
    'google-adsense-account': 'ca-pub-7362041124232949'
  }
}

export const viewport: Viewport = {
  themeColor: '#1F4B3F'
}

const SCRIPT_MODO_COLOR = `(function(){try{var k='kortao-modo-color';var m=localStorage.getItem(k);if(m!=='dark'&&m!=='light')return;document.documentElement.setAttribute('data-color-mode',m);document.documentElement.style.colorScheme=m;document.documentElement.style.backgroundColor=m==='dark'?'#0F1614':'#FBF8F3';}catch(e){}})();`

type RootLayoutProps = {
  children: ReactNode
}

const RootLayout = ({ children }: RootLayoutProps) => {
  return (
    <html lang='es' suppressHydrationWarning>
      <body className={inter.variable}>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_MODO_COLOR }} />
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
