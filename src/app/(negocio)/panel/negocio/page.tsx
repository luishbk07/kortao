import { notFound } from 'next/navigation'
import { PanelNegocio } from '@/presentation/components/business/PanelNegocio'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { exigirRolDueñoORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const NegocioPanelPage = async () => {
  const { negocioId } = await exigirRolDueñoORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    notFound()
  }

  return <PanelNegocio negocio={negocio} />
}

export default NegocioPanelPage
