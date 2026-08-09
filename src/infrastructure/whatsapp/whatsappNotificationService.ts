import type {
  EnviarCancelacionInput,
  NotificationService
} from '@/application/ports/notificationService.port'
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

const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const formatearFechaHora = (fecha: Date): string => {
  return `${formatearFecha(fecha)}, ${formatearHora(fecha)}`
}

const enviarMensajePlantilla = async (
  telefonoDestino: string,
  plantilla: {
    nombre: string
    idioma: string
    parametrosCuerpo: string[]
    parametroBotonUrl?: string
  }
): Promise<void> => {
  const { accessToken, phoneNumberId } = obtenerCredencialesWhatsapp()

  const componentes: Array<Record<string, unknown>> = [
    {
      type: 'body',
      parameters: plantilla.parametrosCuerpo.map((texto) => ({
        type: 'text',
        text: texto
      }))
    }
  ]

  if (plantilla.parametroBotonUrl !== undefined) {
    componentes.push({
      type: 'button',
      sub_type: 'url',
      index: '0',
      parameters: [
        {
          type: 'text',
          text: plantilla.parametroBotonUrl
        }
      ]
    })
  }

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
          name: plantilla.nombre,
          language: {
            code: plantilla.idioma
          },
          components: componentes
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
  enviarConfirmacion: async (cita: Booking) => {
    const telefonoDestino = normalizarTelefono(cita.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    const referencia = cita.id.slice(0, 6)
    const fechaHora = formatearFechaHora(cita.fechaHora)

    await enviarMensajePlantilla(telefonoDestino, {
      nombre: 'jaspers_market_order_confirmation_v1',
      idioma: 'en_US',
      parametrosCuerpo: [cita.clienteNombre, referencia, fechaHora]
    })
  },

  // Stub: scheduled reminders need a Supabase Edge Function with a cron
  // job that checks upcoming citas and calls this (or Meta) later.
  enviarRecordatorio: async (_cita) => {
    return undefined
  },

  // Temporary: uses jaspers_market_order_confirmation_v1 (en_US) until
  // 'cita_cancelada' is approved in Meta. Swap back to that template with
  // its 4 body params (clienteNombre, negocioNombre, fecha, hora) and
  // parametroBotonUrl (negocioSlug) once available.
  enviarCancelacion: async (input: EnviarCancelacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    const referencia = input.negocioSlug.slice(0, 6)
    const fechaHora = formatearFechaHora(input.fechaHora)

    await enviarMensajePlantilla(telefonoDestino, {
      nombre: 'jaspers_market_order_confirmation_v1',
      idioma: 'en_US',
      parametrosCuerpo: [input.clienteNombre, referencia, fechaHora]
    })
  }
}
