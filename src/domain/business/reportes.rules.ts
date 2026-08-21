import type {
  CitaParaReportes,
  ReportesNegocio
} from '@/domain/business/reportes.types'

const MS_30_DIAS = 30 * 24 * 60 * 60 * 1000

const sumarPrecios = (citas: CitaParaReportes[]): number => {
  return citas.reduce((total, cita) => total + (cita.precio ?? 0), 0)
}

const obtenerServicioMasSolicitado = (
  citas: CitaParaReportes[]
): string | null => {
  if (citas.length === 0) {
    return null
  }

  const conteos = citas.reduce<Record<string, number>>((acumulado, cita) => {
    const nombre = cita.servicioNombre.trim() || 'Servicio'
    return {
      ...acumulado,
      [nombre]: (acumulado[nombre] ?? 0) + 1
    }
  }, {})

  return Object.entries(conteos).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

export const calcularReportesNegocio = (
  citasCompletadas: CitaParaReportes[],
  ahora: Date = new Date()
): ReportesNegocio => {
  const limite30Dias = new Date(ahora.getTime() - MS_30_DIAS)
  const citasUltimos30Dias = citasCompletadas.filter(
    (cita) => cita.fechaHora >= limite30Dias
  )
  const ingresosTotales = sumarPrecios(citasCompletadas)
  const citasCompletadasCount = citasCompletadas.length

  return {
    ingresosUltimos30Dias: sumarPrecios(citasUltimos30Dias),
    ingresosTotales,
    servicioMasSolicitado: obtenerServicioMasSolicitado(citasCompletadas),
    ticketPromedio:
      citasCompletadasCount > 0
        ? ingresosTotales / citasCompletadasCount
        : null,
    citasCompletadas: citasCompletadasCount
  }
}
