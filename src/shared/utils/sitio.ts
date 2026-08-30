import { esProduccion } from '@/shared/utils/entorno'

const ORIGEN_LOCAL = 'http://localhost:3000'

export const obtenerOrigenSitio = (): string => {
  const configurado = (
    esProduccion()
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.NEXT_PUBLIC_SITE_URL_DEV ?? process.env.NEXT_PUBLIC_SITE_URL
  )?.trim()

  if (!configurado) {
    return ORIGEN_LOCAL
  }

  return configurado.replace(/\/$/, '')
}

export const construirUrlReserva = (negocioSlug: string): string => {
  return `${obtenerOrigenSitio()}/reservar/${negocioSlug}`
}

/** Opens Google Maps / the device maps chooser (Maps, Waze, etc. on mobile). */
export const construirUrlMapas = (
  direccion: string,
  latitud: number | null,
  longitud: number | null
): string => {
  if (latitud !== null && longitud !== null) {
    return `https://maps.google.com/?q=${latitud},${longitud}`
  }

  return `https://maps.google.com/?q=${encodeURIComponent(direccion.trim())}`
}
