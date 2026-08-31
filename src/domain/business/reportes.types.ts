export type ClienteRecurrente = {
  clienteTelefono: string
  clienteNombre: string
  clienteCorreo: string | null
  numeroVisitas: number
  ultimaVisita: Date
}

export type CitaParaClientes = {
  clienteTelefono: string
  clienteNombre: string
  clienteCorreo: string | null
  fechaHora: Date
}

export type CitaParaReportes = {
  precio: number | null
  fechaHora: Date
  servicioNombre: string
}

export type PeriodoReportes = 'mes_actual' | 'ultimos_30' | 'todo'

export type PuntoIngresoDiario = {
  fecha: string
  monto: number
}

export type PuntoIngresoMensual = {
  mes: string
  etiqueta: string
  monto: number
}

export type IngresoPorServicio = {
  nombre: string
  monto: number
}

export type ReportesPeriodo = {
  periodo: PeriodoReportes
  ingresosPeriodo: number
  ingresosTotales: number
  servicioMasSolicitado: string | null
  ticketPromedio: number | null
  citasCompletadas: number
  variacionPorcentual: number | null
  ingresosPorDia: PuntoIngresoDiario[]
  ingresosPorMes: PuntoIngresoMensual[]
  ingresosPorServicio: IngresoPorServicio[]
  conteoPorServicio: IngresoPorServicio[]
}

export type ReportesNegocio = {
  porPeriodo: Record<PeriodoReportes, ReportesPeriodo>
}
