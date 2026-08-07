import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type { CitaPanel } from '@/domain/business/business.types'

export const crearListarCitasDelDia = (
  businessRepository: BusinessRepository
) => {
  return async (negocioId: string, fecha: Date): Promise<CitaPanel[]> => {
    return businessRepository.listarCitasDelDia(negocioId, fecha)
  }
}
