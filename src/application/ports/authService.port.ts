export type UsuarioAutenticado = {
  id: string
  email: string
  metadata?: {
    nombreNegocio?: string
    telefonoWhatsapp?: string
    direccion?: string
    afiliadoId?: string
  }
}

export type AuthService = {
  iniciarSesion: (
    email: string,
    password: string
  ) => Promise<UsuarioAutenticado>
  cerrarSesion: () => Promise<void>
  obtenerUsuarioActual: () => Promise<UsuarioAutenticado | null>
  solicitarRestablecimientoContrasena: (email: string) => Promise<void>
  actualizarContrasena: (password: string) => Promise<void>
}
