import { notFound } from 'next/navigation'
import { PanelPlan } from '@/presentation/components/business/PanelPlan'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'

const PlanPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    notFound()
  }

  const telefonoSoporte =
    process.env.SOPORTE_WHATSAPP?.trim() || null

  return (
    <PanelPlan
      nombreNegocio={negocio.nombre}
      plan={negocio.plan}
      precioMensual={negocio.precioMensual}
      telefonoSoporte={telefonoSoporte}
    />
  )
}

export default PlanPage
