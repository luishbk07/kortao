import L from 'leaflet'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const resolverUrl = (recurso: string | { src: string }): string => {
  return typeof recurso === 'string' ? recurso : recurso.src
}

let iconoConfigurado = false

export const configurarIconoLeaflet = (): void => {
  if (iconoConfigurado || typeof window === 'undefined') {
    return
  }

  // Leaflet's default marker paths break with bundlers; reassign explicitly.
  const prototipoIcono = L.Icon.Default.prototype as L.Icon & {
    _getIconUrl?: () => string
  }
  delete prototipoIcono._getIconUrl

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: resolverUrl(iconRetinaUrl),
    iconUrl: resolverUrl(iconUrl),
    shadowUrl: resolverUrl(shadowUrl)
  })

  iconoConfigurado = true
}
