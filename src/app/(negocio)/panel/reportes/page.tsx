import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
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

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Reportes
        </Typography>
        <Typography color='text.secondary'>
          Resumen de ingresos y servicios a partir de citas atendidas.
        </Typography>
      </Stack>
      <PanelReportes reportes={reportes} />
    </Stack>
  )
}

export default ReportesPanelPage
