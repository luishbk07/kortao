import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { obtenerCredencialesSupabase } from './obtenerCredenciales'

export const actualizarSesion = async (request: NextRequest) => {
  let respuesta = NextResponse.next({
    request
  })

  const { url, anonKey } = obtenerCredencialesSupabase()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        respuesta = NextResponse.next({
          request
        })

        cookiesToSet.forEach(({ name, value, options }) => {
          respuesta.cookies.set(name, value, options)
        })
      }
    }
  })

  const {
    data: { user }
  } = await supabase.auth.getUser()

  return { respuesta, usuario: user }
}
