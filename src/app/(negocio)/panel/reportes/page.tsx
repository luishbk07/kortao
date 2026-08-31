import { crearObtenerReportesNegocio } from '@/application/useCases/business/obtenerReportesNegocio'
import { MensajePlanPremiumBloqueado } from '@/presentation/components/business/MensajePlanPremiumBloqueado'
import { PanelReportes } from '@/presentation/components/business/PanelReportes'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { esPlanPremium } from '@/shared/utils/planes'

const ReportesPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository, bookingRepository } =
    crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio || !esPlanPremium(negocio.plan)) {
    return <MensajePlanPremiumBloqueado titulo='Reportes' />
  }

  const obtenerReportes = crearObtenerReportesNegocio(bookingRepository)
  const reportes = await obtenerReportes(negocioId)

  return <PanelReportes reportes={reportes} />
}

export default ReportesPanelPage
