import dayjs from 'dayjs'

export const calcularProximaFechaPago = (
  fechaInicioSuscripcion: Date,
  hoy: Date = new Date()
): Date => {
  let proxima = dayjs(fechaInicioSuscripcion).startOf('day')

  if (!proxima.isValid()) {
    throw new Error(
      `fecha_inicio_suscripcion inválida: ${String(fechaInicioSuscripcion)}`
    )
  }

  const referencia = dayjs(hoy).startOf('day')

  while (!proxima.isAfter(referencia)) {
    proxima = proxima.add(1, 'month')
  }

  return proxima.toDate()
}

export const diasHastaFecha = (
  fecha: Date,
  hoy: Date = new Date()
): number => {
  return dayjs(fecha).startOf('day').diff(dayjs(hoy).startOf('day'), 'day')
}
