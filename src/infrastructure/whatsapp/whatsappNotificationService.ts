import type {
  EnviarCancelacionInput,
  EnviarConfirmacionInput,
  NotificationService
} from '@/application/ports/notificationService.port'

type PlantillaWhatsapp = {
  nombre: string
  idioma: string
  parametrosCuerpo: string[]
}

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

const formatearFechaSinAnio = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long'
  })
}

const formatearHora = (fecha: Date): string => {
  return fecha.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const enviarMensajePlantilla = async (
  telefonoDestino: string,
  plantilla: PlantillaWhatsapp
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
          name: plantilla.nombre,
          language: {
            code: plantilla.idioma
          },
          components: [
            {
              type: 'body',
              parameters: plantilla.parametrosCuerpo.map((texto) => ({
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
    console.error(
      `WhatsApp plantilla '${plantilla.nombre}' falló (${respuesta.status}):`,
      detalle
    )
    throw new Error(`Error al enviar WhatsApp: ${detalle}`)
  }
}

export const whatsappNotificationService: NotificationService = {
  // Preferred: reserva_cita_v2 (es_DO)
  // "Hola {{1}}, tu cita en {{2}} está confirmada para el {{3}} a las {{4}}. ¡Te esperamos!"
  enviarConfirmacion: async (input: EnviarConfirmacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    await enviarMensajePlantilla(telefonoDestino, {
      nombre: 'reserva_cita_v2',
      idioma: 'es_DO',
      parametrosCuerpo: [
        input.clienteNombre,
        input.negocioNombre,
        formatearFecha(input.fechaHora),
        formatearHora(input.fechaHora)
      ]
    })
  },

  enviarRecordatorio: async (input: EnviarConfirmacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    await enviarMensajePlantilla(telefonoDestino, {
      nombre: 'recordatorio_cita_v2',
      idioma: 'es_DO',
      parametrosCuerpo: [
        input.clienteNombre,
        input.negocioNombre,
        formatearFecha(input.fechaHora),
        formatearHora(input.fechaHora)
      ]
    })
  },

  // Preferred: cita_cancelada_v2 (es_DO) — body only, no button.
  // Params: clienteNombre, negocioNombre, fecha sin año, hora.
  enviarCancelacion: async (input: EnviarCancelacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    await enviarMensajePlantilla(telefonoDestino, {
      nombre: 'cita_cancelada_v2',
      idioma: 'es_DO',
      parametrosCuerpo: [
        input.clienteNombre,
        input.negocioNombre,
        formatearFechaSinAnio(input.fechaHora),
        formatearHora(input.fechaHora)
      ]
    })
  }
}
