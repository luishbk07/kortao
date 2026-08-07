import type { AuthService } from '@/application/ports/authService.port'
import type { BusinessRepository } from '@/application/ports/businessRepository.port'

export const crearObtenerNegocioActual = (
  authService: AuthService,
  businessRepository: BusinessRepository
) => {
  return async (): Promise<string> => {
    const usuario = await authService.obtenerUsuarioActual()

    if (!usuario) {
      throw new Error('No hay una sesión activa')
    }

    const negocioId = await businessRepository.obtenerNegocioIdPorUsuario(
      usuario.id
    )

    if (!negocioId) {
      throw new Error('Tu usuario no está vinculado a un negocio')
    }

    return negocioId
  }
}
