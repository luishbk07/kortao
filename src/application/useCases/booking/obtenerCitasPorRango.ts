import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import type { Booking } from '@/domain/booking/booking.types'

export const crearObtenerCitasPorRango = (
  bookingRepository: BookingRepository
) => {
  return async (
    negocioId: string,
    desde: Date,
    hasta: Date
  ): Promise<Booking[]> => {
    return bookingRepository.obtenerCitasPorRango(negocioId, desde, hasta)
  }
}
