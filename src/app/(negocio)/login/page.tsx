import type { Metadata } from 'next'
import { FormularioLogin } from '@/presentation/components/business/FormularioLogin'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Acceso al panel de Kortao para gestionar citas, servicios y horarios de tu negocio.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true
    }
  }
}

const LoginPage = () => {
  return <FormularioLogin />
}

export default LoginPage
