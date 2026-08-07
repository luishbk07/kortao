import type { AuthService } from '@/application/ports/authService.port'

export const crearIniciarSesion = (authService: AuthService) => {
  return async (email: string, password: string) => {
    return authService.iniciarSesion(email.trim(), password)
  }
}
