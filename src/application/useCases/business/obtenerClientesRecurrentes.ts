import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import { agruparClientesRecurrentes } from '@/domain/business/clientes.rules'
import type { ClienteRecurrente } from '@/domain/business/reportes.types'

export const crearObtenerClientesRecurrentes = (
  bookingRepository: BookingRepository
) => {
  return async (negocioId: string): Promise<ClienteRecurrente[]> => {
    const citas =
      await bookingRepository.listarCitasParaClientesRecurrentes(negocioId)
    return agruparClientesRecurrentes(citas)
  }
}
