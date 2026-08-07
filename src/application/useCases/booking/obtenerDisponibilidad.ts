import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import { generarSlotsDisponibles } from '@/domain/booking/booking.rules'
import type { BusinessHours, TimeSlot } from '@/domain/booking/booking.types'
import { finDelDia, inicioDelDia } from '@/shared/utils/fechas'

export const crearObtenerDisponibilidad = (
  bookingRepository: BookingRepository
) => {
  return async (
    negocioId: string,
    fecha: Date,
    duracionServicio: number,
    horariosNegocio: BusinessHours[]
  ): Promise<TimeSlot[]> => {
    const slotsOcupados = await bookingRepository.obtenerSlotsOcupados(
      negocioId,
      inicioDelDia(fecha),
      finDelDia(fecha)
    )

    return generarSlotsDisponibles(
      horariosNegocio,
      slotsOcupados,
      fecha,
      duracionServicio
    )
  }
}
