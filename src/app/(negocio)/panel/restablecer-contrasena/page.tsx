import type { Metadata } from 'next'
import { FormularioRestablecerContrasena } from '@/presentation/components/business/FormularioRestablecerContrasena'

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  description: 'Elige una nueva contraseña para tu cuenta de Kortao.'
}

const RestablecerContrasenaPage = () => {
  return <FormularioRestablecerContrasena />
}

export default RestablecerContrasenaPage
