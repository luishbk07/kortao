export type NegocioPublico = {
  id: string
  nombre: string
  slug: string
  telefonoWhatsapp: string
  direccion: string | null
  colorAcento: string | null
  latitud: number | null
  longitud: number | null
  logoUrl: string | null
}

export type ServicioPublico = {
  id: string
  nombre: string
  duracionMinutos: number
  precio: number
}
