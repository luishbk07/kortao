import { crearListarHorarios } from '@/application/useCases/business/listarHorarios'
import { crearObtenerNegocioActual } from '@/application/useCases/business/obtenerNegocioActual'
import { PanelHorarios } from '@/presentation/components/business/PanelHorarios'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'

const HorariosPanelPage = async () => {
  const { authService, businessRepository } = crearDependenciasPanelServidor()
  const obtenerNegocioActual = crearObtenerNegocioActual(
    authService,
    businessRepository
  )
  const listarHorarios = crearListarHorarios(businessRepository)

  const negocioId = await obtenerNegocioActual()
  const horarios = await listarHorarios(negocioId)

  return (
    <PanelHorarios
      negocioId={negocioId}
      horariosIniciales={horarios}
    />
  )
}

export default HorariosPanelPage
