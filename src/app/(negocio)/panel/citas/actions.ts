'use server'

import type { SolicitudCrearReserva } from '@/application/ports/bookingRepository.port'
import { crearCancelarReserva } from '@/application/useCases/booking/cancelarReserva'
import { crearCrearReserva } from '@/application/useCases/booking/crearReserva'
import { crearMarcarCitaAtendida } from '@/application/useCases/booking/marcarCitaAtendida'
import { esCitaYaOcurrida } from '@/domain/booking/cita.rules'
import type { Booking, BusinessHours } from '@/domain/booking/booking.types'
import { crearNotificationServiceCompuesto } from '@/infrastructure/notifications/notificationService.compuesto'
import { resendEmailNotificationService } from '@/infrastructure/notifications/resendEmailNotificationService'
import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearBookingRepository } from '@/infrastructure/supabase/bookingRepository.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { whatsappNotificationService } from '@/infrastructure/whatsapp/whatsappNotificationService'
import { normalizarCorreo } from '@/shared/utils/correo'
import { esPlanPagado } from '@/shared/utils/planes'

const mapearHorarioABusinessHours = (horario: {
  diaSemana: number
  horaInicio: string
  horaFin: string
}): BusinessHours => ({
  diaSemana: horario.diaSemana,
  horaInicio: horario.horaInicio.slice(0, 5),
  horaFin: horario.horaFin.slice(0, 5)
})

const normalizarInputReserva = (
  input: SolicitudCrearReserva
): SolicitudCrearReserva => ({
  ...input,
  fechaHora: new Date(input.fechaHora),
  clienteCorreo: input.clienteCorreo
    ? normalizarCorreo(input.clienteCorreo)
    : null
})

const obtenerContextoPanel = async () => {
  const supabase = crearClienteServidor()
  const authService = crearAuthService(supabase)
  const bookingRepository = crearBookingRepository(supabase)
  const businessRepository = crearBusinessRepository(supabase)

  const usuario = await authService.obtenerUsuarioActual()

  if (!usuario) {
    throw new Error('No hay una sesión activa')
  }

  const negocioId = await businessRepository.obtenerNegocioIdPorUsuario(
    usuario.id
  )

  if (!negocioId) {
    throw new Error('Tu usuario no está vinculado a un negocio')
  }

  return { bookingRepository, businessRepository, negocioId }
}

export const crearCitaManualAction = async (
  input: SolicitudCrearReserva
): Promise<Booking> => {
  const { bookingRepository, businessRepository, negocioId } =
    await obtenerContextoPanel()

  if (input.negocioId !== negocioId) {
    throw new Error('No tienes permiso para crear citas en este negocio')
  }

  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    throw new Error('No se encontraron los datos del negocio')
  }

  if (!esPlanPagado(negocio.plan)) {
    throw new Error(
      'La creación manual de citas está disponible solo en el Plan Premium'
    )
  }

  const inputNormalizado = normalizarInputReserva(input)
  const horarios = (await businessRepository.listarHorarios(negocioId)).map(
    mapearHorarioABusinessHours
  )

  const notificationService = crearNotificationServiceCompuesto(
    whatsappNotificationService,
    resendEmailNotificationService
  )
  const crearReserva = crearCrearReserva(
    bookingRepository,
    notificationService,
    businessRepository
  )

  return crearReserva(
    inputNormalizado,
    horarios,
    negocio.nombre,
    negocio.direccion,
    negocio.logoUrl,
    negocio.plan
  )
}

export const cancelarCitaAction = async (citaId: string): Promise<Booking> => {
  const { bookingRepository, businessRepository, negocioId } =
    await obtenerContextoPanel()

  const cancelarReserva = crearCancelarReserva(bookingRepository)
  const citaCancelada = await cancelarReserva(citaId)

  if (citaCancelada.negocioId !== negocioId) {
    throw new Error('No tienes permiso para cancelar esta cita')
  }

  const negocio = await businessRepository.obtenerNegocioPublicoPorId(negocioId)

  if (!negocio) {
    throw new Error('No se encontraron los datos del negocio')
  }

  const notificationService = crearNotificationServiceCompuesto(
    whatsappNotificationService,
    resendEmailNotificationService
  )

  try {
    await notificationService.enviarCancelacion({
      clienteTelefono: citaCancelada.clienteTelefono,
      clienteNombre: citaCancelada.clienteNombre,
      clienteCorreo: citaCancelada.clienteCorreo,
      negocioNombre: negocio.nombre,
      negocioSlug: negocio.slug,
      negocioLogoUrl: negocio.logoUrl,
      fechaHora: citaCancelada.fechaHora
    })
  } catch (error) {
    // Cancellation already succeeded; notifications must not fail the action.
    console.error('No se pudo enviar la cancelación', error)
  }

  return citaCancelada
}

export const marcarAtendidaAction = async (
  citaId: string,
  precioFinal?: number | null
): Promise<Booking> => {
  const { bookingRepository, negocioId } = await obtenerContextoPanel()

  const cita = await bookingRepository.obtenerCitaPorId(citaId)

  if (!cita) {
    throw new Error('Cita no encontrada')
  }

  if (cita.negocioId !== negocioId) {
    throw new Error('No tienes permiso para actualizar esta cita')
  }

  if (!esCitaYaOcurrida(cita.fechaHora)) {
    throw new Error(
      'No puedes marcar como atendida una cita que aún no ha ocurrido'
    )
  }

  const marcarCitaAtendida = crearMarcarCitaAtendida(bookingRepository)
  return marcarCitaAtendida(citaId, precioFinal)
}
