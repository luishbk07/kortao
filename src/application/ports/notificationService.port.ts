import type { Booking } from '@/domain/booking/booking.types'

export type NotificationService = {
  enviarConfirmacion: (cita: Booking) => Promise<void>
  enviarRecordatorio: (cita: Booking) => Promise<void>
}
