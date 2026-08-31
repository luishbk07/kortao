export type Afiliado = {
  id: string
  nombre: string
  codigo: string
  activo: boolean
  creadoEn: Date
}

export type AfiliadoConMetricas = Afiliado & {
  negociosReferidos: number
  negociosPremium: number
}

export type AfiliadoOpcion = {
  id: string
  nombre: string
  codigo: string
}
