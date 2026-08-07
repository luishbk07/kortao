import type {
  BookingRepository,
  CrearCitaInput
} from '@/application/ports/bookingRepository.port'
import type { NotificationService } from '@/application/ports/notificationService.port'
import { HorarioNoDisponibleError } from '@/domain/booking/booking.errors'
import { esHorarioDisponible } from '@/domain/booking/booking.rules'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { finDelDia, inicioDelDia } from '@/shared/utils/fechas'

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
