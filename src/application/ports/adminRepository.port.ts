import type {
  DetalleNegocioAdmin,
  PagoNegocioAdmin
} from '@/domain/admin/admin.types'

export type AdminRepository = {
  obtenerDetalleNegocio: (
    negocioId: string
  ) => Promise<DetalleNegocioAdmin | null>
  obtenerHistorialPagos: (negocioId: string) => Promise<PagoNegocioAdmin[]>
  registrarPago: (negocioId: string, monto: number) => Promise<PagoNegocioAdmin>
}
