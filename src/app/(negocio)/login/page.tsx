import type { Metadata } from 'next'
import { FormularioLogin } from '@/presentation/components/business/FormularioLogin'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Inicia sesión en Kortao para gestionar las citas, servicios y horarios de tu negocio.',
  robots: {
    index: false,
    follow: false
  }
}

const LoginPage = () => {
  return <FormularioLogin />
}

export default LoginPage
