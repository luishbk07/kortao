'use server'

import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { crearNotificacionesRepository } from '@/infrastructure/supabase/notificacionesRepository.supabase'

const LIMITE_LISTADO = 20

const obtenerContextoNotificaciones = async () => {
  const supabase = crearClienteServidor()
  const authService = crearAuthService(supabase)
  const businessRepository = crearBusinessRepository(supabase)
  const notificacionesRepository = crearNotificacionesRepository(supabase)

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

  return { notificacionesRepository, negocioId }
}

export type NotificacionPanelDto = {
  id: string
  mensaje: string
  leida: boolean
  creadoEn: string
}

export const listarNotificacionesAction = async (): Promise<
  NotificacionPanelDto[]
> => {
  const { notificacionesRepository, negocioId } =
    await obtenerContextoNotificaciones()

  const notificaciones = await notificacionesRepository.listar(
    negocioId,
    LIMITE_LISTADO
  )

  return notificaciones.map((notificacion) => ({
    id: notificacion.id,
    mensaje: notificacion.mensaje,
    leida: notificacion.leida,
    creadoEn: notificacion.creadoEn.toISOString()
  }))
}

export const marcarNotificacionLeidaAction = async (
  notificacionId: string
): Promise<void> => {
  const { notificacionesRepository } = await obtenerContextoNotificaciones()
  await notificacionesRepository.marcarLeida(notificacionId)
}

export const marcarTodasNotificacionesLeidasAction =
  async (): Promise<void> => {
    const { notificacionesRepository, negocioId } =
      await obtenerContextoNotificaciones()
    await notificacionesRepository.marcarTodasLeidas(negocioId)
  }
