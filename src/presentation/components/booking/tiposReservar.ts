export type NegocioPublico = {
  id: string
  nombre: string
  slug: string
  telefonoWhatsapp: string
  direccion: string | null
  colorAcento: string | null
  plan: string
  latitud: number | null
  longitud: number | null
  logoUrl: string | null
}

export type ServicioPublico = {
  id: string
  nombre: string
  duracionMinutos: number
  precio: number | null
  descuentoTipo: 'monto' | 'porcentaje' | null
  descuentoValor: number | null
}
