import { render } from '@react-email/render'
import { Resend } from 'resend'
import type {
  EnviarCancelacionInput,
  EnviarConfirmacionInput,
  NotificationService
} from '@/application/ports/notificationService.port'
import { esCorreoGmail } from '@/shared/utils/correo'
import { crearEnlaceGoogleCalendar } from '@/shared/utils/googleCalendar'
import { construirUrlReserva } from '@/shared/utils/sitio'
import { CancelacionCitaEmail } from './emails/CancelacionCitaEmail'
import { ConfirmacionCitaEmail } from './emails/ConfirmacionCitaEmail'
import { RecordatorioCitaEmail } from './emails/RecordatorioCitaEmail'

const obtenerClienteResend = (): Resend => {
  const apiKey = process.env.RESEND_API_KEY?.trim()

  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY')
  }

  return new Resend(apiKey)
}

const obtenerRemitente = (): string => {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    'Kortao <onboarding@resend.dev>'
  )
}

const formatearFecha = (fecha: Date): string => {
  return fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
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

const exigirCorreo = (correo: string | null): string => {
  const valor = correo?.trim() ?? ''

  if (!valor) {
    throw new Error('El correo del cliente no es válido')
  }

  return valor
}

const obtenerEnlaceGoogleCalendar = (
  input: EnviarConfirmacionInput,
  correo: string
): string | null => {
  if (!esCorreoGmail(correo)) {
    return null
  }

  return crearEnlaceGoogleCalendar({
    titulo: `${input.servicioNombre} — ${input.negocioNombre}`,
    inicio: input.fechaHora,
    duracionMinutos: input.duracionMinutos,
    detalles: `Cita en ${input.negocioNombre}`,
    ubicacion: input.negocioDireccion
  })
}

const enviarCorreo = async (params: {
  para: string
  asunto: string
  html: string
}): Promise<void> => {
  const resend = obtenerClienteResend()
  const { error } = await resend.emails.send({
    from: obtenerRemitente(),
    to: params.para,
    subject: params.asunto,
    html: params.html
  })

  if (error) {
    throw new Error(error.message)
  }
}

export const resendEmailNotificationService: NotificationService = {
  enviarConfirmacion: async (input: EnviarConfirmacionInput) => {
    const correo = exigirCorreo(input.clienteCorreo)
    const html = await render(
      ConfirmacionCitaEmail({
        clienteNombre: input.clienteNombre,
        negocioNombre: input.negocioNombre,
        negocioLogoUrl: input.negocioLogoUrl,
        fechaFormateada: formatearFecha(input.fechaHora),
        horaFormateada: formatearHora(input.fechaHora),
        enlaceGoogleCalendar: obtenerEnlaceGoogleCalendar(input, correo)
      })
    )

    await enviarCorreo({
      para: correo,
      asunto: `Cita confirmada en ${input.negocioNombre}`,
      html
    })
  },

  enviarRecordatorio: async (input: EnviarConfirmacionInput) => {
    const correo = exigirCorreo(input.clienteCorreo)
    const html = await render(
      RecordatorioCitaEmail({
        clienteNombre: input.clienteNombre,
        negocioNombre: input.negocioNombre,
        negocioLogoUrl: input.negocioLogoUrl,
        fechaFormateada: formatearFecha(input.fechaHora),
        horaFormateada: formatearHora(input.fechaHora),
        enlaceGoogleCalendar: obtenerEnlaceGoogleCalendar(input, correo)
      })
    )

    await enviarCorreo({
      para: correo,
      asunto: `Recordatorio de tu cita en ${input.negocioNombre}`,
      html
    })
  },

  enviarCancelacion: async (input: EnviarCancelacionInput) => {
    const correo = exigirCorreo(input.clienteCorreo)
    const html = await render(
      CancelacionCitaEmail({
        clienteNombre: input.clienteNombre,
        negocioNombre: input.negocioNombre,
        negocioLogoUrl: input.negocioLogoUrl,
        fechaFormateada: formatearFecha(input.fechaHora),
        horaFormateada: formatearHora(input.fechaHora),
        enlaceReservar: construirUrlReserva(input.negocioSlug)
      })
    )

    await enviarCorreo({
      para: correo,
      asunto: `Cita cancelada en ${input.negocioNombre}`,
      html
    })
  }
}
