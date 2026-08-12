const ORIGEN_LOCAL = 'http://localhost:3000'

export const obtenerOrigenSitio = (): string => {
  const configurado = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  if (!configurado) {
    return ORIGEN_LOCAL
  }

  return configurado.replace(/\/$/, '')
}

export const construirUrlReserva = (negocioSlug: string): string => {
  return `${obtenerOrigenSitio()}/reservar/${negocioSlug}`
}
