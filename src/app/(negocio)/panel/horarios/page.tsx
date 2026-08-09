import { crearListarHorarios } from '@/application/useCases/business/listarHorarios'
import { PanelHorarios } from '@/presentation/components/business/PanelHorarios'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const HorariosPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const listarHorarios = crearListarHorarios(businessRepository)
  const horarios = await listarHorarios(negocioId)

  return (
    <PanelHorarios
      negocioId={negocioId}
      horariosIniciales={horarios}
    />
  )
}

export default HorariosPanelPage
