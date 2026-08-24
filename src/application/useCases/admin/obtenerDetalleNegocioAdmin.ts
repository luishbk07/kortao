import type { AdminRepository } from '@/application/ports/adminRepository.port'
import type { DetalleNegocioAdmin } from '@/domain/admin/admin.types'

export const crearObtenerDetalleNegocioAdmin = (
  adminRepository: AdminRepository
) => {
  return async (negocioId: string): Promise<DetalleNegocioAdmin | null> => {
    return adminRepository.obtenerDetalleNegocio(negocioId)
  }
}
