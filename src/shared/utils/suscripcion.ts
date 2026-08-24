import {
  formatearFechaCalendario,
  inicioDelDia,
  parsearFechaCalendario
} from '@/shared/utils/fechas'
import { esPlanPremium } from '@/shared/utils/planes'

/** Days before the next payment when we start showing in-panel notices. */
export const DIAS_AVISO_PAGO_SUSCRIPCION = 5

/** Matches dayjs add(1, 'month') end-of-month clamping. */
const sumarUnMesCalendario = (fechaIso: string): string => {
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  const mesSiguiente = mes === 12 ? 1 : mes + 1
  const anioSiguiente = mes === 12 ? anio + 1 : anio
  const ultimoDiaDelMes = new Date(
    Date.UTC(anioSiguiente, mesSiguiente, 0)
  ).getUTCDate()
  const diaAjustado = Math.min(dia, ultimoDiaDelMes)
  const mesTexto = String(mesSiguiente).padStart(2, '0')
  const diaTexto = String(diaAjustado).padStart(2, '0')
  return `${anioSiguiente}-${mesTexto}-${diaTexto}`
}

/**
 * Next subscription payment date on or after `hoy` (calendar day in
 * America/Santo_Domingo). Advances one calendar month at a time from the
 * subscription start date.
 */
export const calcularProximaFechaPago = (
  fechaInicioSuscripcion: Date,
  hoy: Date = new Date()
): Date => {
  let proximaIso = formatearFechaCalendario(fechaInicioSuscripcion)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(proximaIso)) {
    throw new Error(
      `fecha_inicio_suscripcion inválida: ${String(fechaInicioSuscripcion)}`
    )
  }

  const referenciaIso = formatearFechaCalendario(hoy)

  while (proximaIso < referenciaIso) {
    proximaIso = sumarUnMesCalendario(proximaIso)
  }

  return parsearFechaCalendario(proximaIso)
}

export const diasHastaFecha = (
  fecha: Date,
  hoy: Date = new Date()
): number => {
  const inicioFecha = inicioDelDia(fecha).getTime()
  const inicioHoy = inicioDelDia(hoy).getTime()
  return Math.round((inicioFecha - inicioHoy) / (24 * 60 * 60 * 1000))
}

export const debeMostrarAvisoPagoSuscripcion = (
  plan: string,
  suscripcionActiva: boolean,
  fechaInicioSuscripcion: Date | null,
  hoy: Date = new Date()
): boolean => {
  if (
    !esPlanPremium(plan) ||
    !suscripcionActiva ||
    fechaInicioSuscripcion === null
  ) {
    return false
  }

  try {
    const proxima = calcularProximaFechaPago(fechaInicioSuscripcion, hoy)
    const dias = diasHastaFecha(proxima, hoy)
    return dias >= 0 && dias <= DIAS_AVISO_PAGO_SUSCRIPCION
  } catch {
    return false
  }
}

export const formatearMontoRd = (monto: number): string => {
  return `RD$${new Intl.NumberFormat('es-DO').format(monto)}`
}
