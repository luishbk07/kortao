import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import { esCitaYaOcurrida } from '@/domain/booking/cita.rules'
import type { Booking } from '@/domain/booking/booking.types'

export const crearMarcarCitaAtendida = (
  bookingRepository: BookingRepository
) => {
  return async (
    citaId: string,
    precioFinal?: number | null
  ): Promise<Booking> => {
    const cita = await bookingRepository.obtenerCitaPorId(citaId)

    if (!cita) {
      throw new Error('Cita no encontrada')
    }

    if (!esCitaYaOcurrida(cita.fechaHora)) {
      throw new Error(
        'No puedes marcar como atendida una cita que aún no ha ocurrido'
      )
    }

    if (cita.precio === null) {
      if (
        precioFinal === null ||
        precioFinal === undefined ||
        !Number.isFinite(precioFinal) ||
        precioFinal < 0
      ) {
        throw new Error('Debes indicar el monto cobrado por este servicio')
      }

      return bookingRepository.marcarCitaAtendida(citaId, precioFinal)
    }

    return bookingRepository.marcarCitaAtendida(citaId)
  }
}
