import type { SupabaseClient } from '@supabase/supabase-js'
import type { AuthService } from '@/application/ports/authService.port'

const lanzarErrorSupabase = (error: { message: string }): never => {
  throw new Error(error.message)
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

    if (!data.user || !data.user.email) {
      throw new Error('No se pudo iniciar sesión')
    }

    return {
      id: data.user.id,
      email: data.user.email
    }
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

    if (!user || !user.email) {
      return null
    }

    return {
      id: user.id,
      email: user.email
    }
  }
})
