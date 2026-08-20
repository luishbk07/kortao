'use server'

import { crearCancelarReserva } from '@/application/useCases/booking/cancelarReserva'
import { crearMarcarCitaAtendida } from '@/application/useCases/booking/marcarCitaAtendida'
import type { Booking } from '@/domain/booking/booking.types'
import { crearNotificationServiceCompuesto } from '@/infrastructure/notifications/notificationService.compuesto'
import { resendEmailNotificationService } from '@/infrastructure/notifications/resendEmailNotificationService'
import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearBookingRepository } from '@/infrastructure/supabase/bookingRepository.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { whatsappNotificationService } from '@/infrastructure/whatsapp/whatsappNotificationService'

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
  citaId: string
): Promise<Booking> => {
  const { bookingRepository, negocioId } = await obtenerContextoPanel()

  const marcarCitaAtendida = crearMarcarCitaAtendida(bookingRepository)
  const citaCompletada = await marcarCitaAtendida(citaId)

  if (citaCompletada.negocioId !== negocioId) {
    throw new Error('No tienes permiso para actualizar esta cita')
  }

  return citaCompletada
}
