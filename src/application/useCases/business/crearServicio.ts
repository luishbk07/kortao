import type {
  BusinessRepository,
  CrearServicioInput
} from '@/application/ports/businessRepository.port'
import type { Servicio } from '@/domain/business/business.types'

export const crearCrearServicio = (
  businessRepository: BusinessRepository
) => {
  return async (input: CrearServicioInput): Promise<Servicio> => {
    return businessRepository.crearServicio({
      ...input,
      nombre: input.nombre.trim()
    })
  }
}
