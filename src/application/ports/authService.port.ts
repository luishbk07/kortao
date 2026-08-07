export type UsuarioAutenticado = {
  id: string
  email: string
}

export type AuthService = {
  iniciarSesion: (
    email: string,
    password: string
  ) => Promise<UsuarioAutenticado>
  cerrarSesion: () => Promise<void>
  obtenerUsuarioActual: () => Promise<UsuarioAutenticado | null>
}
