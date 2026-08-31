import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  CrearNotificacionInput,
  NotificacionesRepository
} from '@/application/ports/notificacionesRepository.port'
import type { NotificacionNegocio } from '@/domain/notifications/notificacion.types'

const LIMITE_LISTADO_POR_DEFECTO = 20

type NotificacionFila = {
  id: string
  negocio_id: string
  cita_id: string
  mensaje: string
  leida: boolean
  creado_en: string
}

const mapearNotificacion = (fila: NotificacionFila): NotificacionNegocio => ({
  id: fila.id,
  negocioId: fila.negocio_id,
  citaId: fila.cita_id,
  mensaje: fila.mensaje,
  leida: fila.leida,
  creadoEn: new Date(fila.creado_en)
})

export const crearNotificacionesRepository = (
  cliente: SupabaseClient
): NotificacionesRepository => ({
  crear: async (input: CrearNotificacionInput) => {
    const mensajeLimpio = input.mensaje.trim()

    if (mensajeLimpio.length === 0) {
      throw new Error('El mensaje no puede estar vacío')
    }

    const { data, error } = await cliente
      .from('notificaciones_negocio')
      .insert({
        negocio_id: input.negocioId,
        cita_id: input.citaId,
        mensaje: mensajeLimpio
      })
      .select('id, negocio_id, cita_id, mensaje, leida, creado_en')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return mapearNotificacion(data as NotificacionFila)
  },

  contarNoLeidas: async (negocioId) => {
    const { count, error } = await cliente
      .from('notificaciones_negocio')
      .select('*', { count: 'exact', head: true })
      .eq('negocio_id', negocioId)
      .eq('leida', false)

    if (error) {
      throw new Error(error.message)
    }

    return count ?? 0
  },

  listar: async (negocioId, limite = LIMITE_LISTADO_POR_DEFECTO) => {
    const { data, error } = await cliente
      .from('notificaciones_negocio')
      .select('id, negocio_id, cita_id, mensaje, leida, creado_en')
      .eq('negocio_id', negocioId)
      .order('creado_en', { ascending: false })
      .limit(limite)

    if (error) {
      throw new Error(error.message)
    }

    return ((data as NotificacionFila[] | null) ?? []).map(mapearNotificacion)
  },

  marcarLeida: async (notificacionId) => {
    const { error } = await cliente
      .from('notificaciones_negocio')
      .update({ leida: true })
      .eq('id', notificacionId)
      .eq('leida', false)

    if (error) {
      throw new Error(error.message)
    }
  },

  marcarTodasLeidas: async (negocioId) => {
    const { error } = await cliente
      .from('notificaciones_negocio')
      .update({ leida: true })
      .eq('negocio_id', negocioId)
      .eq('leida', false)

    if (error) {
      throw new Error(error.message)
    }
  }
})
