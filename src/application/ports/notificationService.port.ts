import type { Booking } from '@/domain/booking/booking.types'

export type EnviarCancelacionInput = {
  clienteTelefono: string
  clienteNombre: string
  negocioNombre: string
  negocioSlug: string
  fechaHora: Date
}

export type NotificationService = {
  enviarConfirmacion: (cita: Booking) => Promise<void>
  enviarRecordatorio: (cita: Booking) => Promise<void>
  enviarCancelacion: (input: EnviarCancelacionInput) => Promise<void>
}
