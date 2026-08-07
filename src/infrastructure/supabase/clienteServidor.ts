import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { obtenerCredencialesSupabase } from './obtenerCredenciales'

export const crearClienteServidor = () => {
  const { url, anonKey } = obtenerCredencialesSupabase()
  const cookieStore = cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component; middleware refreshes the session.
        }
      }
    }
  })
}
