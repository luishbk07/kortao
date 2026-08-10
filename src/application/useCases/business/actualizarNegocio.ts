import type {
  ActualizarNegocioInput,
  BusinessRepository,
  NegocioDetalle
} from '@/application/ports/businessRepository.port'

export const crearActualizarNegocio = (
  businessRepository: BusinessRepository
) => {
  return async (
    negocioId: string,
    input: ActualizarNegocioInput
  ): Promise<NegocioDetalle> => {
    return businessRepository.actualizarNegocio(negocioId, {
      ...input,
      nombre: input.nombre.trim(),
      telefonoWhatsapp: input.telefonoWhatsapp.trim(),
      direccion: input.direccion?.trim() ? input.direccion.trim() : null
    })
  }
}
