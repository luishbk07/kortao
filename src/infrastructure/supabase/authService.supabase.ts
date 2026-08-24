import type { SupabaseClient, User } from '@supabase/supabase-js'
import type {
  AuthService,
  UsuarioAutenticado
} from '@/application/ports/authService.port'
import { obtenerOrigenSitio } from '@/shared/utils/sitio'

const lanzarErrorSupabase = (error: { message: string }): never => {
  throw new Error(error.message)
}

const leerTextoMetadata = (
  metadata: Record<string, unknown>,
  clave: string
): string | undefined => {
  const valor = metadata[clave]
  return typeof valor === 'string' && valor.length > 0 ? valor : undefined
}

const mapearUsuario = (user: User): UsuarioAutenticado | null => {
  if (!user.email) {
    return null
  }

  const userMetadata = (user.user_metadata ?? {}) as Record<string, unknown>

  return {
    id: user.id,
    email: user.email,
    metadata: {
      nombreNegocio: leerTextoMetadata(userMetadata, 'nombreNegocio'),
      telefonoWhatsapp: leerTextoMetadata(userMetadata, 'telefonoWhatsapp'),
      direccion: leerTextoMetadata(userMetadata, 'direccion')
    }
  }
}

export const crearAuthService = (cliente: SupabaseClient): AuthService => ({
  iniciarSesion: async (email, password) => {
    const { data, error } = await cliente.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      lanzarErrorSupabase(error)
    }

    const usuario = data.user ? mapearUsuario(data.user) : null

    if (!usuario) {
      throw new Error('No se pudo iniciar sesión')
    }

    return usuario
  },

  cerrarSesion: async () => {
    const { error } = await cliente.auth.signOut()

    if (error) {
      lanzarErrorSupabase(error)
    }
  },

  obtenerUsuarioActual: async () => {
    const {
      data: { user },
      error
    } = await cliente.auth.getUser()

    if (error) {
      lanzarErrorSupabase(error)
    }

    if (!user) {
      return null
    }

    return mapearUsuario(user)
  },

  solicitarRestablecimientoContrasena: async (email) => {
    const { error } = await cliente.auth.resetPasswordForEmail(email, {
      redirectTo: `${obtenerOrigenSitio()}/panel/restablecer-contrasena`
    })

    if (error) {
      lanzarErrorSupabase(error)
    }
  },

  actualizarContrasena: async (password) => {
    const { error } = await cliente.auth.updateUser({ password })

    if (error) {
      lanzarErrorSupabase(error)
    }
  }
})
