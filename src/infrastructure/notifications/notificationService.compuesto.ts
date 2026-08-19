import type { NotificationService } from '@/application/ports/notificationService.port'

export const crearNotificationServiceCompuesto = (
  whatsapp: NotificationService,
  email: NotificationService
): NotificationService => ({
  enviarConfirmacion: async (input) => {
    try {
      await whatsapp.enviarConfirmacion(input)
    } catch (error) {
      console.error('No se pudo enviar la confirmación por WhatsApp', error)
    }

    if (!input.clienteCorreo) {
      return
    }

    try {
      await email.enviarConfirmacion(input)
    } catch (error) {
      console.error('No se pudo enviar la confirmación por correo', error)
    }
  },

  enviarRecordatorio: async (input) => {
    try {
      await whatsapp.enviarRecordatorio(input)
    } catch (error) {
      console.error('No se pudo enviar el recordatorio por WhatsApp', error)
    }

    if (!input.clienteCorreo) {
      return
    }

    try {
      await email.enviarRecordatorio(input)
    } catch (error) {
      console.error('No se pudo enviar el recordatorio por correo', error)
    }
  },

  enviarCancelacion: async (input) => {
    try {
      await whatsapp.enviarCancelacion(input)
    } catch (error) {
      console.error('No se pudo enviar la cancelación por WhatsApp', error)
    }

    if (!input.clienteCorreo) {
      return
    }

    try {
      await email.enviarCancelacion(input)
    } catch (error) {
      console.error('No se pudo enviar la cancelación por correo', error)
    }
  }
})
