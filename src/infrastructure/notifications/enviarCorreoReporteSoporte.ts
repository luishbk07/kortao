import { Resend } from 'resend'

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

const construirHtmlReporteSoporte = (
  nombreNegocio: string,
  mensaje: string
): string => {
  const mensajeEscapado = mensaje
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\n', '<br />')

  return `
    <div style="background-color:#FBF8F3;padding:32px 16px;font-family:sans-serif;">
      <div style="max-width:480px;margin:0 auto;background-color:#FFFFFF;border-radius:16px;padding:32px;">
        <p style="color:#1C1C1A;font-size:18px;font-weight:600;margin:0 0 16px;">
          Nuevo reporte de soporte
        </p>
        <p style="color:#1C1C1A;font-size:16px;">
          Negocio: <strong style="color:#1F4B3F;">${nombreNegocio}</strong>
        </p>
        <p style="color:#1C1C1A;font-size:16px;margin:16px 0 8px;">Mensaje:</p>
        <p style="color:#1C1C1A;font-size:16px;background-color:#FBF8F3;border-radius:12px;padding:16px;margin:0;">
          ${mensajeEscapado}
        </p>
        <hr style="border:none;border-top:1px solid #E7E2D8;margin:24px 0;" />
        <p style="color:#6B6862;font-size:13px;text-align:center;">Kortao</p>
      </div>
    </div>
  `
}

export const enviarCorreoReporteSoporte = async (params: {
  nombreNegocio: string
  mensaje: string
}): Promise<void> => {
  const destino = process.env.SOPORTE_ADMIN_EMAIL?.trim()

  if (!destino) {
    throw new Error('Missing SOPORTE_ADMIN_EMAIL')
  }

  const resend = obtenerClienteResend()
  const { error } = await resend.emails.send({
    from: obtenerRemitente(),
    to: destino,
    subject: `Nuevo reporte de soporte — ${params.nombreNegocio}`,
    html: construirHtmlReporteSoporte(params.nombreNegocio, params.mensaje)
  })

  if (error) {
    throw new Error(error.message)
  }
}
