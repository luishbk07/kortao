import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import type { Booking } from '@/domain/booking/booking.types'

export const crearMarcarCitaAtendida = (
  bookingRepository: BookingRepository
) => {
  return async (citaId: string): Promise<Booking> => {
    return bookingRepository.marcarCitaAtendida(citaId)
  }
}
