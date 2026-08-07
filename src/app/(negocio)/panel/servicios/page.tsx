import { crearListarServicios } from '@/application/useCases/business/listarServicios'
import { crearObtenerNegocioActual } from '@/application/useCases/business/obtenerNegocioActual'
import { PanelServicios } from '@/presentation/components/business/PanelServicios'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'

const ServiciosPanelPage = async () => {
  const { authService, businessRepository } = crearDependenciasPanelServidor()
  const obtenerNegocioActual = crearObtenerNegocioActual(
    authService,
    businessRepository
  )
  const listarServicios = crearListarServicios(businessRepository)

  const negocioId = await obtenerNegocioActual()
  const servicios = await listarServicios(negocioId)

  return (
    <PanelServicios
      negocioId={negocioId}
      serviciosIniciales={servicios}
    />
  )
}

export default ServiciosPanelPage
