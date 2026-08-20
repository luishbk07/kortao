export const LOGO_KORTAO_EMAIL =
  'https://kortao.com/brand/kortao-email-logo.png'

export const coloresEmail = {
  crema: '#FBF8F3',
  blanco: '#FFFFFF',
  bosque: '#1F4B3F',
  terracota: '#C1693A',
  muted: '#6B6862',
  texto: '#2C2A26'
} as const

export const estilosEmail = {
  body: {
    backgroundColor: coloresEmail.crema,
    fontFamily:
      '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
    margin: '0',
    padding: '24px 12px'
  },
  contenedor: {
    backgroundColor: coloresEmail.blanco,
    borderRadius: '12px',
    margin: '0 auto',
    maxWidth: '520px',
    padding: '32px 28px'
  },
  logo: {
    display: 'block',
    maxHeight: '60px',
    maxWidth: '220px',
    margin: '0 auto 24px',
    objectFit: 'contain' as const
  },
  saludo: {
    color: coloresEmail.texto,
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px'
  },
  parrafo: {
    color: coloresEmail.texto,
    fontSize: '16px',
    lineHeight: '24px',
    margin: '0 0 16px'
  },
  destacado: {
    color: coloresEmail.bosque,
    fontWeight: 700
  },
  boton: {
    backgroundColor: coloresEmail.terracota,
    borderRadius: '8px',
    color: coloresEmail.blanco,
    display: 'inline-block',
    fontSize: '14px',
    fontWeight: 600,
    padding: '12px 20px',
    textDecoration: 'none'
  },
  seccionBoton: {
    margin: '28px 0 8px',
    textAlign: 'center' as const
  },
  divisor: {
    borderColor: '#E8E4DC',
    borderTop: '1px solid #E8E4DC',
    margin: '28px 0 16px'
  },
  pie: {
    color: coloresEmail.muted,
    fontSize: '12px',
    lineHeight: '18px',
    margin: '0',
    textAlign: 'center' as const
  }
} as const

export type PropsEmailCitaBase = {
  clienteNombre: string
  negocioNombre: string
  negocioLogoUrl: string | null
  fechaFormateada: string
  horaFormateada: string
}

export const obtenerUrlLogoEmail = (
  negocioLogoUrl: string | null
): string => {
  const url = negocioLogoUrl?.trim()
  return url || LOGO_KORTAO_EMAIL
}

export const obtenerAltLogoEmail = (
  negocioLogoUrl: string | null,
  negocioNombre: string
): string => {
  return negocioLogoUrl?.trim() ? `Logo de ${negocioNombre}` : 'Kortao'
}
