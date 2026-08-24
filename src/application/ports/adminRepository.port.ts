import type { DetalleNegocioAdmin } from '@/domain/admin/admin.types'

export type AdminRepository = {
  obtenerDetalleNegocio: (
    negocioId: string
  ) => Promise<DetalleNegocioAdmin | null>
}
