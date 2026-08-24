import type { AdminRepository } from '@/application/ports/adminRepository.port'
import type { PagoNegocioAdmin } from '@/domain/admin/admin.types'

export const crearObtenerHistorialPagos = (
  adminRepository: AdminRepository
) => {
  return async (negocioId: string): Promise<PagoNegocioAdmin[]> => {
    return adminRepository.obtenerHistorialPagos(negocioId)
  }
}
