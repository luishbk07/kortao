import {
  formatearFechaCalendario,
  inicioDelDia,
  parsearFechaCalendario
} from '@/shared/utils/fechas'
import {
  esPlanPremium,
  type CicloFacturacion
} from '@/shared/utils/planes'

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

const sumarMesesCalendario = (
  fechaIso: string,
  cantidadMeses: number
): string => {
  let resultado = fechaIso

  for (let indice = 0; indice < cantidadMeses; indice += 1) {
    resultado = sumarUnMesCalendario(resultado)
  }

  return resultado
}

const mesesPorCiclo = (ciclo: CicloFacturacion): number => {
  return ciclo === 'anual' ? 12 : 1
}

/**
 * Next unpaid subscription due date on or after `hoy` (calendar day in
 * America/Santo_Domingo). Advances by one month (mensual) or twelve
 * (anual) from the subscription start date. If `fechaUltimoPago` already
 * covers that anniversary, steps forward one more cycle (e.g. annual paid
 * on the start date → next year).
 */
export const calcularProximaFechaPago = (
  fechaInicioSuscripcion: Date,
  ciclo: CicloFacturacion = 'mensual',
  hoy: Date = new Date(),
  fechaUltimoPago: Date | null = null
): Date => {
  let proximaIso = formatearFechaCalendario(fechaInicioSuscripcion)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(proximaIso)) {
    throw new Error(
      `fecha_inicio_suscripcion inválida: ${String(fechaInicioSuscripcion)}`
    )
  }

  const referenciaIso = formatearFechaCalendario(hoy)
  const meses = mesesPorCiclo(ciclo)

  while (proximaIso < referenciaIso) {
    proximaIso = sumarMesesCalendario(proximaIso, meses)
  }

  if (fechaUltimoPago !== null) {
    const ultimoPagoIso = formatearFechaCalendario(fechaUltimoPago)

    while (ultimoPagoIso >= proximaIso) {
      proximaIso = sumarMesesCalendario(proximaIso, meses)
    }
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
  fechaUltimoPago: Date | null = null,
  ciclo: CicloFacturacion = 'mensual',
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
    if (
      cicloActualEstaAlDia(
        fechaInicioSuscripcion,
        fechaUltimoPago,
        ciclo,
        hoy
      ) === true
    ) {
      return false
    }

    const proxima = calcularProximaFechaPago(
      fechaInicioSuscripcion,
      ciclo,
      hoy,
      fechaUltimoPago
    )
    const dias = diasHastaFecha(proxima, hoy)
    return dias >= 0 && dias <= DIAS_AVISO_PAGO_SUSCRIPCION
  } catch {
    return false
  }
}

export const formatearMontoRd = (monto: number): string => {
  return `RD$${new Intl.NumberFormat('es-DO').format(monto)}`
}

/**
 * Latest billing anniversary on or before `hoy`, derived only from
 * fecha_inicio_suscripcion (same stepping as próxima fecha de pago).
 * Returns null if the subscription start is still in the future.
 */
export const calcularUltimaFechaVencimiento = (
  fechaInicioSuscripcion: Date,
  ciclo: CicloFacturacion = 'mensual',
  hoy: Date = new Date()
): Date | null => {
  let actualIso = formatearFechaCalendario(fechaInicioSuscripcion)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(actualIso)) {
    throw new Error(
      `fecha_inicio_suscripcion inválida: ${String(fechaInicioSuscripcion)}`
    )
  }

  const hoyIso = formatearFechaCalendario(hoy)
  const meses = mesesPorCiclo(ciclo)

  if (actualIso > hoyIso) {
    return null
  }

  while (true) {
    const siguienteIso = sumarMesesCalendario(actualIso, meses)

    if (siguienteIso > hoyIso) {
      return parsearFechaCalendario(actualIso)
    }

    actualIso = siguienteIso
  }
}

/** Read-only aid: latest ledger payment covers the current billing cycle. */
export const cicloActualEstaAlDia = (
  fechaInicioSuscripcion: Date,
  fechaUltimoPago: Date | null,
  ciclo: CicloFacturacion = 'mensual',
  hoy: Date = new Date()
): boolean | null => {
  const ultimaVencimiento = calcularUltimaFechaVencimiento(
    fechaInicioSuscripcion,
    ciclo,
    hoy
  )

  if (ultimaVencimiento === null) {
    return null
  }

  if (fechaUltimoPago === null) {
    return false
  }

  return (
    formatearFechaCalendario(fechaUltimoPago) >=
    formatearFechaCalendario(ultimaVencimiento)
  )
}
