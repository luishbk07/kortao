import type { Booking } from '@/domain/booking/booking.types'

export type CrearCitaInput = {
  negocioId: string
  servicioId: string
  clienteNombre: string
  clienteTelefono: string
  fechaHora: Date
  duracionMinutos: number
}

export type BookingRepository = {
  obtenerCitasPorRango: (
    negocioId: string,
    desde: Date,
    hasta: Date
  ) => Promise<Booking[]>
  crearCita: (input: CrearCitaInput) => Promise<Booking>
  cancelarCita: (citaId: string) => Promise<Booking>
}
