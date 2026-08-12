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
    horariosNegocio: BusinessHours[],
    negocioNombre: string
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
      input.duracionMinutos,
      new Date()
    )

    if (!disponible) {
      throw new HorarioNoDisponibleError()
    }

    const cita = await bookingRepository.crearCita(input)

    try {
      await notificationService.enviarConfirmacion({
        id: cita.id,
        clienteTelefono: cita.clienteTelefono,
        clienteNombre: cita.clienteNombre,
        negocioNombre,
        fechaHora: cita.fechaHora
      })
    } catch (error) {
      // Booking already succeeded; WhatsApp must not fail the reservation.
      console.error('No se pudo enviar la confirmación por WhatsApp', error)
    }

    return cita
  }
}
