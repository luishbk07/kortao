import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Inter } from 'next/font/google'
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
    apple: '/icons/icon-192.png'
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
      </body>
    </html>
  )
}

export default RootLayout
