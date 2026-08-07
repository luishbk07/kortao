import type {
  BookingRepository,
  CrearCitaInput
} from '@/application/ports/bookingRepository.port'
import type { NotificationService } from '@/application/ports/notificationService.port'
import { HorarioNoDisponibleError } from '@/domain/booking/booking.errors'
import { esHorarioDisponible } from '@/domain/booking/booking.rules'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'

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

export const crearCrearReserva = (
  bookingRepository: BookingRepository,
  notificationService: NotificationService
) => {
  return async (
    input: CrearCitaInput,
    horariosNegocio: BusinessHours[]
  ): Promise<Booking> => {
    const slotsOcupados = await bookingRepository.obtenerSlotsOcupados(
      input.negocioId,
      inicioDelDia(input.fechaHora),
      finDelDia(input.fechaHora)
    )

    const disponible = esHorarioDisponible(
      horariosNegocio,
      slotsOcupados,
      input.fechaHora,
      input.duracionMinutos
    )

    if (!disponible) {
      throw new HorarioNoDisponibleError()
    }

    const cita = await bookingRepository.crearCita(input)
    await notificationService.enviarConfirmacion(cita)

    return cita
  }
}
