import type { Booking, OccupiedSlot } from '@/domain/booking/booking.types'
import type {
  CitaParaClientes,
  CitaParaReportes
} from '@/domain/business/reportes.types'

export type CrearCitaInput = {
  negocioId: string
  servicioId: string
  clienteNombre: string
  clienteTelefono: string
  clienteCorreo: string | null
  fechaHora: Date
  duracionMinutos: number
  precio: number
}

export type SolicitudCrearReserva = Omit<CrearCitaInput, 'precio'>

export type BookingRepository = {
  obtenerSlotsOcupados: (
    negocioId: string,
    desde: Date,
    hasta: Date
  ) => Promise<OccupiedSlot[]>
  obtenerCitasPorRango: (
    negocioId: string,
    desde: Date,
    hasta: Date
  ) => Promise<Booking[]>
  contarCitasTotales: (negocioId: string) => Promise<number>
  listarCitasParaClientesRecurrentes: (
    negocioId: string
  ) => Promise<CitaParaClientes[]>
  listarCitasCompletadasParaReportes: (
    negocioId: string
  ) => Promise<CitaParaReportes[]>
  crearCita: (input: CrearCitaInput) => Promise<Booking>
  obtenerCitaPorId: (citaId: string) => Promise<Booking | null>
  cancelarCita: (citaId: string) => Promise<Booking>
  marcarCitaAtendida: (citaId: string) => Promise<Booking>
}
