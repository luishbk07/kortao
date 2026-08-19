const ZONA_HORARIA = 'America/Santo_Domingo'

export type EventoGoogleCalendar = {
  titulo: string
  inicio: Date
  duracionMinutos: number
  detalles?: string
  ubicacion?: string | null
}

const obtenerPartesFecha = (
  fecha: Date
): {
  anio: string
  mes: string
  dia: string
  hora: string
  minuto: string
  segundo: string
} => {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: ZONA_HORARIA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(fecha)

  const valor = (tipo: Intl.DateTimeFormatPartTypes): string =>
    partes.find((parte) => parte.type === tipo)?.value ?? '00'

  return {
    anio: valor('year'),
    mes: valor('month'),
    dia: valor('day'),
    hora: valor('hour'),
    minuto: valor('minute'),
    segundo: valor('second')
  }
}

const formatearFechaGoogle = (fecha: Date): string => {
  const { anio, mes, dia, hora, minuto, segundo } = obtenerPartesFecha(fecha)
  return `${anio}${mes}${dia}T${hora}${minuto}${segundo}`
}

export const crearEnlaceGoogleCalendar = (
  evento: EventoGoogleCalendar
): string => {
  const fin = new Date(
    evento.inicio.getTime() + evento.duracionMinutos * 60 * 1000
  )
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: evento.titulo,
    dates: `${formatearFechaGoogle(evento.inicio)}/${formatearFechaGoogle(fin)}`
  })

  if (evento.detalles?.trim()) {
    params.set('details', evento.detalles.trim())
  }

  if (evento.ubicacion?.trim()) {
    params.set('location', evento.ubicacion.trim())
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
