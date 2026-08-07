import { crearObtenerNegocioActual } from '@/application/useCases/business/obtenerNegocioActual'
import { PanelCitas } from '@/presentation/components/business/PanelCitas'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'

const CitasPanelPage = async () => {
  const { authService, businessRepository } = crearDependenciasPanelServidor()
  const obtenerNegocioActual = crearObtenerNegocioActual(
    authService,
    businessRepository
  )

  const negocioId = await obtenerNegocioActual()

  return <PanelCitas negocioId={negocioId} />
}

export default CitasPanelPage
