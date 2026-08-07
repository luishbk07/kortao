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
  const esLogin = pathname === '/login'

  if (esRutaPanel && !usuario) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return redirigirConSesion(loginUrl, respuesta)
  }

  if (esLogin && usuario) {
    const panelUrl = request.nextUrl.clone()
    panelUrl.pathname = '/panel/citas'
    return redirigirConSesion(panelUrl, respuesta)
  }

  return respuesta
}

export const config = {
  matcher: ['/panel/:path*', '/login']
}
