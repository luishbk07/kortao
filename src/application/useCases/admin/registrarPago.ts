import type { AdminRepository } from '@/application/ports/adminRepository.port'
import type { PagoNegocioAdmin } from '@/domain/admin/admin.types'

export const crearRegistrarPago = (adminRepository: AdminRepository) => {
  return async (
    negocioId: string,
    monto: number
  ): Promise<PagoNegocioAdmin> => {
    return adminRepository.registrarPago(negocioId, monto)
  }
}
