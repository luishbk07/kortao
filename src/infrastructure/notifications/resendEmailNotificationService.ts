import { Resend } from 'resend'
import type {
  EnviarCancelacionInput,
  EnviarConfirmacionInput,
  NotificationService
} from '@/application/ports/notificationService.port'

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

    await enviarCorreo({
      para: correo,
      asunto: `Cita confirmada en ${input.negocioNombre}`,
      html: `
        <p>Hola ${input.clienteNombre},</p>
        <p>
          Tu cita en <strong>${input.negocioNombre}</strong> está confirmada
          para el <strong>${formatearFecha(input.fechaHora)}</strong>
          a las <strong>${formatearHora(input.fechaHora)}</strong>.
        </p>
        <p>Te esperamos.</p>
        <p style="color:#6B6862;font-size:12px;">Kortao</p>
      `
    })
  },

  enviarRecordatorio: async (input: EnviarConfirmacionInput) => {
    const correo = exigirCorreo(input.clienteCorreo)

    await enviarCorreo({
      para: correo,
      asunto: `Recordatorio de tu cita en ${input.negocioNombre}`,
      html: `
        <p>Hola ${input.clienteNombre},</p>
        <p>
          Te recordamos tu cita en <strong>${input.negocioNombre}</strong>
          el <strong>${formatearFecha(input.fechaHora)}</strong>
          a las <strong>${formatearHora(input.fechaHora)}</strong>.
        </p>
        <p>Te esperamos.</p>
        <p style="color:#6B6862;font-size:12px;">Kortao</p>
      `
    })
  },

  enviarCancelacion: async (input: EnviarCancelacionInput) => {
    const correo = exigirCorreo(input.clienteCorreo)

    await enviarCorreo({
      para: correo,
      asunto: `Cita cancelada en ${input.negocioNombre}`,
      html: `
        <p>Hola ${input.clienteNombre},</p>
        <p>
          Tu cita en <strong>${input.negocioNombre}</strong>
          del <strong>${formatearFecha(input.fechaHora)}</strong>
          a las <strong>${formatearHora(input.fechaHora)}</strong>
          fue cancelada.
        </p>
        <p>Si deseas, puedes volver a reservar cuando quieras.</p>
        <p style="color:#6B6862;font-size:12px;">Kortao</p>
      `
    })
  }
}
