import type {
  ActualizarServicioInput,
  BusinessRepository
} from '@/application/ports/businessRepository.port'
import type { Servicio } from '@/domain/business/business.types'

export const crearActualizarServicio = (
  businessRepository: BusinessRepository
) => {
  return async (
    servicioId: string,
    input: ActualizarServicioInput
  ): Promise<Servicio> => {
    return businessRepository.actualizarServicio(servicioId, {
      ...input,
      nombre: input.nombre.trim()
    })
  }
}
