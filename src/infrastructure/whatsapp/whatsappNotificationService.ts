import type { NotificationService } from '@/application/ports/notificationService.port'
import type { Booking } from '@/domain/booking/booking.types'

const obtenerCredencialesWhatsapp = (): {
  accessToken: string
  phoneNumberId: string
} => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim()
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()

  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID'
    )
  }

  return { accessToken, phoneNumberId }
}

const normalizarTelefono = (telefono: string): string => {
  return telefono
    .replace(/\+/g, '')
    .replace(/\s/g, '')
    .replace(/-/g, '')
    .replace(/[()]/g, '')
    .replace(/\D/g, '')
}

const formatearFechaHora = (fecha: Date): string => {
  const fechaTexto = fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
  const horaTexto = fecha.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })

  return `${fechaTexto}, ${horaTexto}`
}

const enviarMensajePlantilla = async (
  telefonoDestino: string,
  parametrosCuerpo: [string, string, string]
): Promise<void> => {
  const { accessToken, phoneNumberId } = obtenerCredencialesWhatsapp()

  const respuesta = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: telefonoDestino,
        type: 'template',
        template: {
          name: 'jaspers_market_order_confirmation_v1',
          language: {
            code: 'en_US'
          },
          components: [
            {
              type: 'body',
              parameters: parametrosCuerpo.map((texto) => ({
                type: 'text',
                text: texto
              }))
            }
          ]
        }
      })
    }
  )

  if (!respuesta.ok) {
    const detalle = await respuesta.text()
    throw new Error(`Error al enviar WhatsApp: ${detalle}`)
  }
}

export const whatsappNotificationService: NotificationService = {
  // Temporary placeholder: jaspers_market_order_confirmation_v1 (en_US) is a
  // Meta sample template used only until we get a custom Spanish confirmation
  // template approved in WhatsApp Manager. Replace name, language and body
  // params with that custom template when available.
  enviarConfirmacion: async (cita) => {
    const telefonoDestino = normalizarTelefono(cita.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    const referencia = cita.id.slice(0, 6)
    const fechaHora = formatearFechaHora(cita.fechaHora)

    await enviarMensajePlantilla(telefonoDestino, [
      cita.clienteNombre,
      referencia,
      fechaHora
    ])
  },

  // Stub: scheduled reminders need a Supabase Edge Function with a cron
  // job that checks upcoming citas and calls this (or Meta) later.
  enviarRecordatorio: async (_cita) => {
    return undefined
  }
}
