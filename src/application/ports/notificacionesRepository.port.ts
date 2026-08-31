import type { NotificacionNegocio } from '@/domain/notifications/notificacion.types'

export type CrearNotificacionInput = {
  negocioId: string
  citaId: string
  mensaje: string
}

export type NotificacionesRepository = {
  crear: (input: CrearNotificacionInput) => Promise<NotificacionNegocio>
  contarNoLeidas: (negocioId: string) => Promise<number>
  listar: (
    negocioId: string,
    limite?: number
  ) => Promise<NotificacionNegocio[]>
  marcarLeida: (notificacionId: string) => Promise<void>
  marcarTodasLeidas: (negocioId: string) => Promise<void>
}
