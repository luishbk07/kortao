import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import { generarSlotsDisponibles } from '@/domain/booking/booking.rules'
import type { BusinessHours, TimeSlot } from '@/domain/booking/booking.types'

const inicioDelDia = (fecha: Date): Date => {
  const inicio = new Date(fecha)
  inicio.setHours(0, 0, 0, 0)
  return inicio
}

const finDelDia = (fecha: Date): Date => {
  const fin = new Date(fecha)
  fin.setHours(23, 59, 59, 999)
  return fin
}

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
