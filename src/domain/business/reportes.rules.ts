import {
  crearFechaEnZona,
  formatearFechaCalendario,
  inicioDelDia,
  obtenerPartesEnZona
} from '@/shared/utils/fechas'
import type {
  CitaParaReportes,
  IngresoPorServicio,
  PeriodoReportes,
  PuntoIngresoDiario,
  PuntoIngresoMensual,
  ReportesNegocio,
  ReportesPeriodo
} from '@/domain/business/reportes.types'

const MS_UN_DIA = 24 * 60 * 60 * 1000
const TOP_SERVICIOS_DONUT = 4

const MESES_ETIQUETA = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic'
] as const

const sumarPrecios = (citas: CitaParaReportes[]): number => {
  return citas.reduce((total, cita) => total + (cita.precio ?? 0), 0)
}

const nombreServicio = (cita: CitaParaReportes): string => {
  return cita.servicioNombre.trim() || 'Servicio'
}

const obtenerServicioMasSolicitado = (
  citas: CitaParaReportes[]
): string | null => {
  if (citas.length === 0) {
    return null
  }

  const conteos = citas.reduce<Record<string, number>>((acumulado, cita) => {
    const nombre = nombreServicio(cita)
    return {
      ...acumulado,
      [nombre]: (acumulado[nombre] ?? 0) + 1
    }
  }, {})

  return Object.entries(conteos).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

const claveMes = (fecha: Date): string => {
  const partes = obtenerPartesEnZona(fecha)
  return `${partes.anio}-${String(partes.mes).padStart(2, '0')}`
}

const etiquetaMes = (clave: string): string => {
  const [, mesTexto] = clave.split('-')
  const mes = Number(mesTexto)
  return MESES_ETIQUETA[mes - 1] ?? clave
}

const sumarDiasCalendario = (fecha: Date, dias: number): Date => {
  const partes = obtenerPartesEnZona(fecha)
  const baseUtc = Date.UTC(partes.anio, partes.mes - 1, partes.dia)
  const siguiente = new Date(baseUtc + dias * MS_UN_DIA)
  return crearFechaEnZona(
    siguiente.getUTCFullYear(),
    siguiente.getUTCMonth() + 1,
    siguiente.getUTCDate(),
    0,
    0,
    0,
    0
  )
}

const inicioMesActual = (ahora: Date): Date => {
  const partes = obtenerPartesEnZona(ahora)
  return crearFechaEnZona(partes.anio, partes.mes, 1, 0, 0, 0, 0)
}

const obtenerRangoPeriodo = (
  periodo: PeriodoReportes,
  ahora: Date
): { inicio: Date | null; fin: Date } => {
  const fin = ahora

  if (periodo === 'todo') {
    return { inicio: null, fin }
  }

  if (periodo === 'mes_actual') {
    return { inicio: inicioMesActual(ahora), fin }
  }

  const inicioHoy = inicioDelDia(ahora)
  return { inicio: sumarDiasCalendario(inicioHoy, -29), fin }
}

const obtenerRangoAnterior = (
  periodo: PeriodoReportes,
  ahora: Date
): { inicio: Date; fin: Date } | null => {
  if (periodo === 'todo') {
    return null
  }

  if (periodo === 'mes_actual') {
    const inicioActual = inicioMesActual(ahora)
    const partes = obtenerPartesEnZona(inicioActual)
    const mesAnterior = partes.mes === 1 ? 12 : partes.mes - 1
    const anioAnterior = partes.mes === 1 ? partes.anio - 1 : partes.anio
    const inicio = crearFechaEnZona(anioAnterior, mesAnterior, 1, 0, 0, 0, 0)
    const fin = new Date(inicioActual.getTime() - 1)
    return { inicio, fin }
  }

  const inicioHoy = inicioDelDia(ahora)
  const inicioActual = sumarDiasCalendario(inicioHoy, -29)
  const finAnterior = new Date(inicioActual.getTime() - 1)
  const inicioAnterior = sumarDiasCalendario(inicioDelDia(finAnterior), -29)
  return { inicio: inicioAnterior, fin: finAnterior }
}

const filtrarCitasEnRango = (
  citas: CitaParaReportes[],
  inicio: Date | null,
  fin: Date
): CitaParaReportes[] => {
  return citas.filter((cita) => {
    if (cita.fechaHora > fin) {
      return false
    }

    if (inicio !== null && cita.fechaHora < inicio) {
      return false
    }

    return true
  })
}

const calcularVariacionPorcentual = (
  actual: number,
  anterior: number
): number | null => {
  if (anterior <= 0) {
    return actual > 0 ? 100 : null
  }

  return ((actual - anterior) / anterior) * 100
}

const construirIngresosPorDia = (
  citas: CitaParaReportes[],
  inicio: Date | null,
  fin: Date
): PuntoIngresoDiario[] => {
  if (citas.length === 0 && inicio === null) {
    return []
  }

  const porDia = citas.reduce<Record<string, number>>((acumulado, cita) => {
    const clave = formatearFechaCalendario(cita.fechaHora)
    return {
      ...acumulado,
      [clave]: (acumulado[clave] ?? 0) + (cita.precio ?? 0)
    }
  }, {})

  let cursor: Date

  if (inicio !== null) {
    cursor = inicioDelDia(inicio)
  } else {
    const masAntigua = citas.reduce(
      (minima, cita) =>
        cita.fechaHora < minima ? cita.fechaHora : minima,
      citas[0]?.fechaHora ?? fin
    )
    cursor = inicioDelDia(masAntigua)
  }

  const finDia = inicioDelDia(fin)
  const puntos: PuntoIngresoDiario[] = []
  let guard = 0

  while (cursor.getTime() <= finDia.getTime() && guard < 400) {
    const clave = formatearFechaCalendario(cursor)
    puntos.push({ fecha: clave, monto: porDia[clave] ?? 0 })
    cursor = sumarDiasCalendario(cursor, 1)
    guard += 1
  }

  return puntos
}

const construirIngresosPorMes = (
  citas: CitaParaReportes[],
  ahora: Date,
  mesesAtras = 11
): PuntoIngresoMensual[] => {
  const partesAhora = obtenerPartesEnZona(ahora)
  const claves: string[] = []

  for (let indice = mesesAtras; indice >= 0; indice -= 1) {
    const desplazamiento = partesAhora.mes - 1 - indice
    const anio =
      partesAhora.anio + Math.floor(desplazamiento / 12)
    const mes = ((desplazamiento % 12) + 12) % 12 + 1
    claves.push(`${anio}-${String(mes).padStart(2, '0')}`)
  }

  const porMes = citas.reduce<Record<string, number>>((acumulado, cita) => {
    const clave = claveMes(cita.fechaHora)
    return {
      ...acumulado,
      [clave]: (acumulado[clave] ?? 0) + (cita.precio ?? 0)
    }
  }, {})

  return claves.map((mes) => ({
    mes,
    etiqueta: etiquetaMes(mes),
    monto: porMes[mes] ?? 0
  }))
}

const agruparPorServicio = (
  citas: CitaParaReportes[],
  porMonto: boolean
): IngresoPorServicio[] => {
  const acumulado = citas.reduce<Record<string, number>>((mapa, cita) => {
    const nombre = nombreServicio(cita)
    const valor = porMonto ? (cita.precio ?? 0) : 1
    return {
      ...mapa,
      [nombre]: (mapa[nombre] ?? 0) + valor
    }
  }, {})

  return Object.entries(acumulado)
    .map(([nombre, monto]) => ({ nombre, monto }))
    .sort((a, b) => b.monto - a.monto)
}

const compactarTopServicios = (
  items: IngresoPorServicio[],
  limite = TOP_SERVICIOS_DONUT
): IngresoPorServicio[] => {
  if (items.length <= limite) {
    return items
  }

  const principales = items.slice(0, limite)
  const resto = items.slice(limite).reduce((total, item) => total + item.monto, 0)

  if (resto <= 0) {
    return principales
  }

  return [...principales, { nombre: 'Otros', monto: resto }]
}

const calcularSnapshotPeriodo = (
  citasCompletadas: CitaParaReportes[],
  periodo: PeriodoReportes,
  ahora: Date
): ReportesPeriodo => {
  const { inicio, fin } = obtenerRangoPeriodo(periodo, ahora)
  const citasPeriodo = filtrarCitasEnRango(citasCompletadas, inicio, fin)
  const ingresosPeriodo = sumarPrecios(citasPeriodo)
  const ingresosTotales = sumarPrecios(citasCompletadas)
  const citasCompletadasCount = citasPeriodo.length

  const rangoAnterior = obtenerRangoAnterior(periodo, ahora)
  let variacionPorcentual: number | null = null

  if (rangoAnterior) {
    const citasAnteriores = filtrarCitasEnRango(
      citasCompletadas,
      rangoAnterior.inicio,
      rangoAnterior.fin
    )
    variacionPorcentual = calcularVariacionPorcentual(
      ingresosPeriodo,
      sumarPrecios(citasAnteriores)
    )
  }

  const ingresosPorServicio = compactarTopServicios(
    agruparPorServicio(citasPeriodo, true)
  )
  const conteoPorServicio = compactarTopServicios(
    agruparPorServicio(citasPeriodo, false)
  )

  return {
    periodo,
    ingresosPeriodo,
    ingresosTotales,
    servicioMasSolicitado: obtenerServicioMasSolicitado(citasPeriodo),
    ticketPromedio:
      citasCompletadasCount > 0
        ? ingresosPeriodo / citasCompletadasCount
        : null,
    citasCompletadas: citasCompletadasCount,
    variacionPorcentual,
    ingresosPorDia: construirIngresosPorDia(citasPeriodo, inicio, fin),
    ingresosPorMes: construirIngresosPorMes(citasCompletadas, ahora),
    ingresosPorServicio,
    conteoPorServicio
  }
}

export const calcularReportesNegocio = (
  citasCompletadas: CitaParaReportes[],
  ahora: Date = new Date()
): ReportesNegocio => {
  const periodos: PeriodoReportes[] = ['mes_actual', 'ultimos_30', 'todo']

  const porPeriodo = periodos.reduce<Record<PeriodoReportes, ReportesPeriodo>>(
    (acumulado, periodo) => {
      return {
        ...acumulado,
        [periodo]: calcularSnapshotPeriodo(citasCompletadas, periodo, ahora)
      }
    },
    {} as Record<PeriodoReportes, ReportesPeriodo>
  )

  return { porPeriodo }
}
