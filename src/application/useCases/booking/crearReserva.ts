import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type {
  BookingRepository,
  SolicitudCrearReserva
} from '@/application/ports/bookingRepository.port'
import type { NotificationService } from '@/application/ports/notificationService.port'
import {
  HorarioNoDisponibleError,
  LimiteDePlanError
} from '@/domain/booking/booking.errors'
import { esHorarioDisponible } from '@/domain/booking/booking.rules'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { calcularPrecioFinal } from '@/domain/business/servicio.rules'
import { finDelDia, inicioDelDia } from '@/shared/utils/fechas'
import {
  esPlanPremium,
  LIMITE_CITAS_FUTURAS_PLAN_GRATIS
} from '@/shared/utils/planes'

export const crearCrearReserva = (
  bookingRepository: BookingRepository,
  notificationService: NotificationService,
  businessRepository: BusinessRepository
) => {
  return async (
    input: SolicitudCrearReserva,
    horariosNegocio: BusinessHours[],
    negocioNombre: string,
    negocioDireccion: string | null = null,
    negocioLogoUrl: string | null = null,
    negocioPlan = 'estandar'
  ): Promise<Booking> => {
    if (!esPlanPremium(negocioPlan)) {
      const citasFuturasActivas =
        await bookingRepository.contarCitasFuturasActivas(input.negocioId)

      if (citasFuturasActivas >= LIMITE_CITAS_FUTURAS_PLAN_GRATIS) {
        throw new LimiteDePlanError()
      }
    }

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

    const servicio = await businessRepository.obtenerServicioPorId(
      input.servicioId
    )

    if (!servicio || servicio.negocioId !== input.negocioId) {
      throw new Error('El servicio no está disponible')
    }

    const precio = calcularPrecioFinal(
      servicio.precio,
      servicio.descuentoTipo,
      servicio.descuentoValor
    )

    const cita = await bookingRepository.crearCita({
      ...input,
      precio
    })

    try {
      await notificationService.enviarConfirmacion({
        id: cita.id,
        clienteTelefono: cita.clienteTelefono,
        clienteNombre: cita.clienteNombre,
        clienteCorreo: cita.clienteCorreo,
        negocioNombre,
        negocioDireccion,
        negocioLogoUrl,
        servicioNombre: cita.servicioNombre,
        fechaHora: cita.fechaHora,
        duracionMinutos: cita.duracionMinutos
      })
    } catch (error) {
      // Booking already succeeded; notifications must not fail the reservation.
      console.error('No se pudo enviar la confirmación', error)
    }

    return cita
  }
}
