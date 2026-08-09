import { PanelCitas } from '@/presentation/components/business/PanelCitas'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const CitasPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocioSlug = await businessRepository.obtenerSlugPorNegocioId(negocioId)

  return (
    <PanelCitas
      negocioId={negocioId}
      negocioSlug={negocioSlug ?? ''}
    />
  )
}

export default CitasPanelPage
