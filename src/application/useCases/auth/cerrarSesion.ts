import type { AuthService } from '@/application/ports/authService.port'

export const crearCerrarSesion = (authService: AuthService) => {
  return async () => {
    await authService.cerrarSesion()
  }
}
