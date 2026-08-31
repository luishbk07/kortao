import type { Metadata } from 'next'
import { FormularioLogin } from '@/presentation/components/business/FormularioLogin'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Acceso al panel de Kortao para gestionar citas, servicios y horarios de tu negocio.',
  robots: {
    index: false,
    follow: false
  }
}

const LoginPage = () => {
  const telefonoSoporte = process.env.SOPORTE_WHATSAPP?.trim() || null

  return <FormularioLogin telefonoSoporte={telefonoSoporte} />
}

export default LoginPage
