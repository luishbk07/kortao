import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { crearObtenerClientesRecurrentes } from '@/application/useCases/business/obtenerClientesRecurrentes'
import { ListaClientesRecurrentes } from '@/presentation/components/business/ListaClientesRecurrentes'
import { MensajePlanPremiumBloqueado } from '@/presentation/components/business/MensajePlanPremiumBloqueado'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { esPlanPremium } from '@/shared/utils/planes'

const ClientesPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository, bookingRepository } =
    crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio || !esPlanPremium(negocio.plan)) {
    return <MensajePlanPremiumBloqueado titulo='Clientes' />
  }

  const obtenerClientes = crearObtenerClientesRecurrentes(bookingRepository)
  const clientes = await obtenerClientes(negocioId)

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant='h5' component='h1' color='primary'>
          Clientes
        </Typography>
        <Typography color='text.secondary'>
          Clientes que han reservado (sin contar canceladas). Por defecto se
          muestran quienes tienen 2 o más visitas.
        </Typography>
      </Stack>
      <ListaClientesRecurrentes clientes={clientes} />
    </Stack>
  )
}

export default ClientesPanelPage
