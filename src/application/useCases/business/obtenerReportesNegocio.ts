import type { BookingRepository } from '@/application/ports/bookingRepository.port'
import { calcularReportesNegocio } from '@/domain/business/reportes.rules'
import type { ReportesNegocio } from '@/domain/business/reportes.types'

export const crearObtenerReportesNegocio = (
  bookingRepository: BookingRepository
) => {
  return async (negocioId: string): Promise<ReportesNegocio> => {
    const citas =
      await bookingRepository.listarCitasCompletadasParaReportes(negocioId)
    return calcularReportesNegocio(citas)
  }
}
