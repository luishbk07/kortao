import type { AuthService } from '@/application/ports/authService.port'

export const crearActualizarContrasena = (authService: AuthService) => {
  return async (password: string): Promise<void> => {
    await authService.actualizarContrasena(password)
  }
}
