import { crearListarServicios } from '@/application/useCases/business/listarServicios'
import { PanelServicios } from '@/presentation/components/business/PanelServicios'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { exigirRolDueñoORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const ServiciosPanelPage = async () => {
  const { negocioId } = await exigirRolDueñoORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const listarServicios = crearListarServicios(businessRepository)
  const servicios = await listarServicios(negocioId)

  return (
    <PanelServicios
      negocioId={negocioId}
      serviciosIniciales={servicios}
    />
  )
}

export default ServiciosPanelPage
