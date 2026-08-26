import type { Metadata } from 'next'
import { FormularioRegistro } from '@/presentation/components/auth/FormularioRegistro'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description:
    'Registra tu negocio en Kortao para recibir reservas online de tus clientes.',
  robots: {
    index: false,
    follow: false
  }
}

const RegistroPage = () => {
  return <FormularioRegistro />
}

export default RegistroPage
