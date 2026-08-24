import type { AuthService } from '@/application/ports/authService.port'

export const crearSolicitarRestablecimientoContrasena = (
  authService: AuthService
) => {
  return async (email: string): Promise<void> => {
    await authService.solicitarRestablecimientoContrasena(email.trim())
  }
}
