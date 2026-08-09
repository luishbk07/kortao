import { redirect } from 'next/navigation'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'

export const obtenerNegocioIdORedirigir = async (): Promise<string> => {
  const { authService, businessRepository } = crearDependenciasPanelServidor()
  const usuario = await authService.obtenerUsuarioActual()

  if (!usuario) {
    redirect('/login')
  }

  const negocioId = await businessRepository.obtenerNegocioIdPorUsuario(
    usuario.id
  )

  if (!negocioId) {
    redirect('/panel/onboarding')
  }

  return negocioId
}
