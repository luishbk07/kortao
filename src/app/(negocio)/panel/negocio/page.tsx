import { notFound } from 'next/navigation'
import { PanelNegocio } from '@/presentation/components/business/PanelNegocio'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const NegocioPanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    notFound()
  }

  return <PanelNegocio negocio={negocio} />
}

export default NegocioPanelPage
