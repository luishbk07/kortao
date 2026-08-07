import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type { HorarioNegocio } from '@/domain/business/business.types'

export const crearListarHorarios = (
  businessRepository: BusinessRepository
) => {
  return async (negocioId: string): Promise<HorarioNegocio[]> => {
    return businessRepository.listarHorarios(negocioId)
  }
}
