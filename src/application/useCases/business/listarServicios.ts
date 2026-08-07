import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type { Servicio } from '@/domain/business/business.types'

export const crearListarServicios = (
  businessRepository: BusinessRepository
) => {
  return async (negocioId: string): Promise<Servicio[]> => {
    return businessRepository.listarServicios(negocioId)
  }
}
