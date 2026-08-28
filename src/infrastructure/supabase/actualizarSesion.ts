import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { obtenerCredencialesSupabase } from './obtenerCredenciales'

const crearRespuestaConPathname = (request: NextRequest): NextResponse => {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-pathname', request.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  })
}

export const actualizarSesion = async (request: NextRequest) => {
  let respuesta = crearRespuestaConPathname(request)

  const { url, anonKey } = obtenerCredencialesSupabase()

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value)
        })

        respuesta = crearRespuestaConPathname(request)

        cookiesToSet.forEach(({ name, value, options }) => {
          respuesta.cookies.set(name, value, options)
        })
      }
    }
  })

  let user = null

  try {
    const {
      data: { user: usuarioSesion },
      error
    } = await supabase.auth.getUser()

    if (!error) {
      user = usuarioSesion
    }
  } catch {
    user = null
  }

  return { respuesta, usuario: user }
}
