import type { EstadoCita } from '@/domain/booking/booking.types'
import type { CicloFacturacion } from '@/shared/utils/planes'

export type CitaAdminResumen = {
  id: string
  fechaHora: Date
  clienteNombre: string
  servicioNombre: string
  estado: EstadoCita
}

export type MetricasNegocioAdmin = {
  totalCitas: number
  citasCompletadas: number
  citasCanceladas: number
  ingresosTotales: number
  fechaCitaMasReciente: Date | null
}

export type NegocioAdminDetalle = {
  id: string
  nombre: string
  slug: string
  plan: string
  precioMensual: number | null
  cicloFacturacion: CicloFacturacion
  fechaInicioSuscripcion: Date
  suscripcionActiva: boolean
}

export type DetalleNegocioAdmin = {
  negocio: NegocioAdminDetalle
  metricas: MetricasNegocioAdmin
  citasRecientes: CitaAdminResumen[]
}

export type PagoNegocioAdmin = {
  id: string
  fechaPago: Date
  monto: number
}
