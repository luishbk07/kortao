import type { BusinessRepository } from '@/application/ports/businessRepository.port'
import type { Servicio } from '@/domain/business/business.types'

export const crearAlternarServicioActivo = (
  businessRepository: BusinessRepository
) => {
  return async (servicio: Servicio): Promise<Servicio> => {
    return businessRepository.actualizarServicio(servicio.id, {
      nombre: servicio.nombre,
      duracionMinutos: servicio.duracionMinutos,
      precio: servicio.precio,
      descuentoTipo: servicio.descuentoTipo,
      descuentoValor: servicio.descuentoValor,
      activo: !servicio.activo
    })
  }
}
