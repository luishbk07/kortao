export const LIMITE_CITAS_PLAN_GRATIS = 5

export type PlanNegocio = 'estandar' | 'personal' | 'premium' | 'max'

/** Paid single-user features: no ads, Clientes, Reportes, Personalización, QR, manual booking. */
export const esPlanPagado = (plan: string): boolean => {
  return plan === 'personal' || plan === 'premium' || plan === 'max'
}

/** Employee management (Premium / Max). */
export const esPlanMultiUsuario = (plan: string): boolean => {
  return plan === 'premium' || plan === 'max'
}

export const PRECIO_LISTA_PLAN_PREMIUM = 1000

/** Default Kortao support WhatsApp (DR): (829) 812-5495 */
export const TELEFONO_SOPORTE_KORTAO = '18298125495'

export type CicloFacturacion = 'mensual' | 'anual'

export const BENEFICIOS_PLAN_PREMIUM = [
  'Sin anuncios en el panel',
  'Clientes recurrentes',
  'Reportes extendidos',
  'Personalización de color'
] as const

export const OPCIONES_PLAN_ADMIN = [
  { valor: 'estandar', etiqueta: 'Estándar', deshabilitado: false },
  { valor: 'personal', etiqueta: 'Personal', deshabilitado: false },
  { valor: 'premium', etiqueta: 'Premium', deshabilitado: false },
  {
    valor: 'max',
    etiqueta: 'Max (próximamente)',
    deshabilitado: true
  }
] as const

export const PLANES_ASIGNABLES_ADMIN = [
  'estandar',
  'personal',
  'premium'
] as const

export const etiquetaPlanNegocio = (plan: string): string => {
  if (plan === 'estandar') {
    return 'Estándar'
  }

  if (plan === 'personal') {
    return 'Personal'
  }

  if (plan === 'premium') {
    return 'Premium'
  }

  if (plan === 'max') {
    return 'Max'
  }

  return plan
}

export const normalizarCicloFacturacion = (
  valor: string | null | undefined
): CicloFacturacion => {
  return valor === 'anual' ? 'anual' : 'mensual'
}

/**
 * Amount due for one billing cycle from the monthly list price.
 * Annual is 12 months with a 10% discount. Keep all cycle math here.
 */
export const calcularMontoCiclo = (
  precioMensual: number,
  ciclo: CicloFacturacion
): number => {
  if (ciclo === 'anual') {
    return precioMensual * 12 * 0.9
  }

  return precioMensual
}

export const etiquetaProximoPagoCiclo = (
  ciclo: CicloFacturacion
): string => {
  return ciclo === 'anual' ? 'próximo pago anual' : 'próximo pago mensual'
}

export const formatearPrecioMensual = (precio: number): string => {
  return `RD$${new Intl.NumberFormat('es-DO').format(precio - 1)}/mes`
}

export const construirEnlaceWhatsappSoporte = (
  telefonoSoporte: string,
  nombreNegocio: string
): string => {
  const telefono = telefonoSoporte.replace(/\D/g, '')
  const mensaje = encodeURIComponent(
    `Hola, quiero activar el plan Premium de Kortao para ${nombreNegocio}`
  )

  return `https://wa.me/${telefono}?text=${mensaje}`
}
