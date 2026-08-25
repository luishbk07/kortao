import type {
  EstadoReporteSoporte,
  ReporteSoporte,
  ReporteSoporteAdmin
} from '@/domain/support/support.types'

export type SupportRepository = {
  crearReporte: (
    negocioId: string,
    mensaje: string
  ) => Promise<ReporteSoporte>
  listarPorNegocio: (negocioId: string) => Promise<ReporteSoporte[]>
  listarTodosAdmin: () => Promise<ReporteSoporteAdmin[]>
  actualizarEstado: (
    reporteId: string,
    estado: EstadoReporteSoporte
  ) => Promise<ReporteSoporteAdmin>
}
