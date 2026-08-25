export type EstadoReporteSoporte = 'pendiente' | 'resuelto'

export type ReporteSoporte = {
  id: string
  negocioId: string
  mensaje: string
  estado: EstadoReporteSoporte
  creadoEn: Date
}

export type ReporteSoporteAdmin = ReporteSoporte & {
  negocioNombre: string
}
