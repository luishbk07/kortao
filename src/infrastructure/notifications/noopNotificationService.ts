import type { NotificationService } from '@/application/ports/notificationService.port'

export const noopNotificationService: NotificationService = {
  enviarConfirmacion: async () => undefined,
  enviarRecordatorio: async () => undefined
}
