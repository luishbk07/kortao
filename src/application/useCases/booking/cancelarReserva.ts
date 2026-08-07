import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import type { Booking } from '@/domain/booking/booking.types'

export const crearCancelarReserva = (
  bookingRepository: BookingRepository
) => {
  return async (citaId: string): Promise<Booking> => {
    return bookingRepository.cancelarCita(citaId)
  }
}
