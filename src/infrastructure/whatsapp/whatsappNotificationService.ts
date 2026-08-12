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

const PLANTILLA_MUESTRA: PlantillaWhatsapp = {
  nombre: 'jaspers_market_order_confirmation_v1',
  idioma: 'en_US',
  parametrosCuerpo: []
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

const formatearFechaHora = (fecha: Date): string => {
  return `${formatearFecha(fecha)}, ${formatearHora(fecha)}`
}

const extraerCodigoErrorMeta = (detalle: string): number | undefined => {
  try {
    const jsonTexto = detalle.replace(/^Error al enviar WhatsApp:\s*/, '')
    const cuerpo = JSON.parse(jsonTexto) as {
      error?: { code?: number }
    }
    return typeof cuerpo.error?.code === 'number'
      ? cuerpo.error.code
      : undefined
  } catch {
    return undefined
  }
}

const esPlantillaInexistenteONoAprobada = (detalle: string): boolean => {
  const codigo = extraerCodigoErrorMeta(detalle)
  if (codigo === 132001) {
    return true
  }

  const mensaje = detalle.toLowerCase()
  return mensaje.includes('template') && mensaje.includes('does not exist')
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
    throw new Error(`Error al enviar WhatsApp: ${detalle}`)
  }
}

const enviarPlantillaConFallback = async (
  telefonoDestino: string,
  preferida: PlantillaWhatsapp,
  fallback: PlantillaWhatsapp
): Promise<void> => {
  try {
    await enviarMensajePlantilla(telefonoDestino, preferida)
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error)

    if (!esPlantillaInexistenteONoAprobada(detalle)) {
      throw error
    }

    console.warn(
      `Plantilla WhatsApp '${preferida.nombre}' no disponible o no aprobada; usando fallback '${fallback.nombre}'.`
    )
    await enviarMensajePlantilla(telefonoDestino, fallback)
  }
}

const plantillaMuestraTresParametros = (
  clienteNombre: string,
  referencia: string,
  fechaHora: Date
): PlantillaWhatsapp => ({
  ...PLANTILLA_MUESTRA,
  parametrosCuerpo: [
    clienteNombre,
    referencia,
    formatearFechaHora(fechaHora)
  ]
})

export const whatsappNotificationService: NotificationService = {
  // Preferred: reserva_de_cita (es_DO)
  // "Hola {{1}}, tu cita en {{2}} está confirmada para el {{3}} a las {{4}}. ¡Te esperamos!"
  enviarConfirmacion: async (input: EnviarConfirmacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    await enviarPlantillaConFallback(
      telefonoDestino,
      {
        nombre: 'reserva_de_cita',
        idioma: 'es_DO',
        parametrosCuerpo: [
          input.clienteNombre,
          input.negocioNombre,
          formatearFecha(input.fechaHora),
          formatearHora(input.fechaHora)
        ]
      },
      plantillaMuestraTresParametros(
        input.clienteNombre,
        input.id.slice(0, 6),
        input.fechaHora
      )
    )
  },

  // Preferred: recordatorio_cita (pending Meta approval) — expects fallback until approved.
  enviarRecordatorio: async (input: EnviarConfirmacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    await enviarPlantillaConFallback(
      telefonoDestino,
      {
        nombre: 'recordatorio_cita',
        idioma: 'es_DO',
        parametrosCuerpo: [
          input.clienteNombre,
          input.negocioNombre,
          formatearFecha(input.fechaHora),
          formatearHora(input.fechaHora)
        ]
      },
      plantillaMuestraTresParametros(
        input.clienteNombre,
        input.id.slice(0, 6),
        input.fechaHora
      )
    )
  },

  // Preferred: cita_cancelada (es_DO) — body only, no button.
  // Params: clienteNombre, negocioNombre, fecha sin año, hora.
  enviarCancelacion: async (input: EnviarCancelacionInput) => {
    const telefonoDestino = normalizarTelefono(input.clienteTelefono)

    if (!telefonoDestino) {
      throw new Error('El teléfono del cliente no es válido')
    }

    await enviarPlantillaConFallback(
      telefonoDestino,
      {
        nombre: 'cita_cancelada',
        idioma: 'es_DO',
        parametrosCuerpo: [
          input.clienteNombre,
          input.negocioNombre,
          formatearFechaSinAnio(input.fechaHora),
          formatearHora(input.fechaHora)
        ]
      },
      plantillaMuestraTresParametros(
        input.clienteNombre,
        input.negocioSlug.slice(0, 6),
        input.fechaHora
      )
    )
  }
}
