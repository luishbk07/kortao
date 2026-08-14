import { NextResponse, type NextRequest } from 'next/server'
import { actualizarSesion } from '@/infrastructure/supabase/actualizarSesion'

const redirigirConSesion = (
  url: URL,
  respuestaSesion: NextResponse
): NextResponse => {
  const redireccion = NextResponse.redirect(url)

  respuestaSesion.cookies.getAll().forEach((cookie) => {
    redireccion.cookies.set(cookie.name, cookie.value)
  })

  return redireccion
}

export const middleware = async (request: NextRequest) => {
  const { respuesta, usuario } = await actualizarSesion(request)
  const { pathname } = request.nextUrl
  const esRutaPanel = pathname.startsWith('/panel')
  const esRutaAdmin = pathname.startsWith('/admin')
  const esLogin = pathname === '/login'
  const esRegistro = pathname === '/registro'

  // Only /panel/* and /admin/* require auth. '/' stays public for the landing page.
  if ((esRutaPanel || esRutaAdmin) && !usuario) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return redirigirConSesion(loginUrl, respuesta)
  }

  // Authenticated users hitting auth screens go through '/' for routing.
  if ((esLogin || esRegistro) && usuario) {
    const inicioUrl = request.nextUrl.clone()
    inicioUrl.pathname = '/'
    return redirigirConSesion(inicioUrl, respuesta)
  }

  return respuesta
}

export const config = {
  matcher: ['/panel/:path*', '/admin/:path*', '/login', '/registro']
}
