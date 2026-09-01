import { LIMITE_CITAS_PLAN_GRATIS } from '@/shared/utils/planes'

export type FilaComparacionPlan = {
  etiqueta: string
  disponible: boolean
  destacado?: boolean
}

export const FILAS_PLAN_ESTANDAR: FilaComparacionPlan[] = [
  { etiqueta: 'Confirmación por WhatsApp y email', disponible: true },
  {
    etiqueta: `Hasta ${LIMITE_CITAS_PLAN_GRATIS} citas en total`,
    disponible: true
  },
  { etiqueta: 'Anuncios en el panel', disponible: true },
  { etiqueta: 'Clientes recurrentes', disponible: false },
  { etiqueta: 'Reportes extendidos', disponible: false },
  { etiqueta: 'Crear tus propias citas', disponible: false },
  { etiqueta: 'Código QR para tu negocio', disponible: false },
  { etiqueta: 'Personalización de color', disponible: false }
]

export const FILAS_PLAN_PREMIUM: FilaComparacionPlan[] = [
  { etiqueta: 'Confirmación por WhatsApp y email', disponible: true },
  {
    etiqueta: 'Citas ilimitadas',
    disponible: true,
    destacado: true
  },
  { etiqueta: 'Sin anuncios en el panel', disponible: true },
  { etiqueta: 'Clientes recurrentes', disponible: true },
  { etiqueta: 'Reportes extendidos', disponible: true },
  { etiqueta: 'Crear tus propias citas', disponible: true },
  { etiqueta: 'Código QR para tu negocio', disponible: true },
  { etiqueta: 'Personalización de color', disponible: true }
]
