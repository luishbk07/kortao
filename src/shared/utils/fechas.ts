export const ZONA_HORARIA_NEGOCIO = 'America/Santo_Domingo'

/** República Dominicana does not observe DST; AST is UTC-4 year-round. */
const OFFSET_AST_MS = 4 * 60 * 60 * 1000

const DIAS_SEMANA_EN: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
}

export type PartesFechaZona = {
  anio: number
  mes: number
  dia: number
  hora: number
  minuto: number
  segundo: number
}

export const obtenerPartesEnZona = (
  fecha: Date,
  zonaHoraria: string = ZONA_HORARIA_NEGOCIO
): PartesFechaZona => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(fecha)

  const valor = (tipo: Intl.DateTimeFormatPartTypes): string =>
    partes.find((parte) => parte.type === tipo)?.value ?? '0'

  return {
    anio: Number(valor('year')),
    mes: Number(valor('month')),
    dia: Number(valor('day')),
    hora: Number(valor('hour')),
    minuto: Number(valor('minute')),
    segundo: Number(valor('second'))
  }
}

/**
 * Builds an absolute Instant whose wall-clock time in America/Santo_Domingo
 * matches the given calendar components. Safe on Vercel (UTC) and locally.
 */
export const crearFechaEnZona = (
  anio: number,
  mes: number,
  dia: number,
  hora = 0,
  minuto = 0,
  segundo = 0,
  milisegundo = 0
): Date =>
  new Date(
    Date.UTC(anio, mes - 1, dia, hora, minuto, segundo, milisegundo) + OFFSET_AST_MS
  )

export const obtenerDiaSemanaEnZona = (
  fecha: Date,
  zonaHoraria: string = ZONA_HORARIA_NEGOCIO
): number => {
  const etiqueta = new Intl.DateTimeFormat('en-US', {
    timeZone: zonaHoraria,
    weekday: 'short'
  }).format(fecha)

  return DIAS_SEMANA_EN[etiqueta] ?? 0
}

export const obtenerMinutosDelDiaEnZona = (
  fecha: Date,
  zonaHoraria: string = ZONA_HORARIA_NEGOCIO
): number => {
  const partes = obtenerPartesEnZona(fecha, zonaHoraria)
  return partes.hora * 60 + partes.minuto
}

export const combinarFechaYMinutosEnZona = (
  fecha: Date,
  minutosDelDia: number,
  zonaHoraria: string = ZONA_HORARIA_NEGOCIO
): Date => {
  const partes = obtenerPartesEnZona(fecha, zonaHoraria)
  const horas = Math.floor(minutosDelDia / 60)
  const minutos = minutosDelDia % 60
  return crearFechaEnZona(partes.anio, partes.mes, partes.dia, horas, minutos, 0, 0)
}

/** Start of calendar day in America/Santo_Domingo (00:00:00.000 AST). */
export const inicioDelDia = (fecha: Date): Date => {
  const partes = obtenerPartesEnZona(fecha)
  return crearFechaEnZona(partes.anio, partes.mes, partes.dia, 0, 0, 0, 0)
}

/** End of calendar day in America/Santo_Domingo (23:59:59.999 AST). */
export const finDelDia = (fecha: Date): Date => {
  const partes = obtenerPartesEnZona(fecha)
  return crearFechaEnZona(partes.anio, partes.mes, partes.dia, 23, 59, 59, 999)
}

/** Calendar date YYYY-MM-DD in America/Santo_Domingo. */
export const formatearFechaCalendario = (fecha: Date): string => {
  const partes = obtenerPartesEnZona(fecha)
  const mes = String(partes.mes).padStart(2, '0')
  const dia = String(partes.dia).padStart(2, '0')
  return `${partes.anio}-${mes}-${dia}`
}

/** Parse YYYY-MM-DD as midnight America/Santo_Domingo (not process-local). */
export const parsearFechaCalendario = (fechaIso: string): Date => {
  const [anio, mes, dia] = fechaIso.split('-').map(Number)
  return crearFechaEnZona(anio, mes, dia, 0, 0, 0, 0)
}

/** Human-readable date in America/Santo_Domingo (e.g. for WhatsApp/email). */
export const formatearFechaLegible = (
  fecha: Date,
  conAnio: boolean
): string => {
  return fecha.toLocaleDateString('es-DO', {
    day: 'numeric',
    month: 'long',
    ...(conAnio ? { year: 'numeric' as const } : {}),
    timeZone: ZONA_HORARIA_NEGOCIO
  })
}

/** Human-readable time in America/Santo_Domingo (e.g. "10:30 a. m."). */
export const formatearHoraLegible = (fecha: Date): string => {
  return fecha.toLocaleTimeString('es-DO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: ZONA_HORARIA_NEGOCIO
  })
}
