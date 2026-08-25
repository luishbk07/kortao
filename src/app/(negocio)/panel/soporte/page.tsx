import { notFound } from 'next/navigation'
import { PanelSoporte } from '@/presentation/components/business/PanelSoporte'
import { crearDependenciasPanelServidor } from '@/presentation/lib/crearDependenciasPanelServidor'
import { obtenerNegocioIdORedirigir } from '@/presentation/lib/obtenerNegocioIdORedirigir'
import { crearSupportRepository } from '@/infrastructure/supabase/supportRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

const SoportePanelPage = async () => {
  const negocioId = await obtenerNegocioIdORedirigir()
  const { businessRepository } = crearDependenciasPanelServidor()
  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    notFound()
  }

  const supportRepository = crearSupportRepository(crearClienteServidor())
  const reportes = await supportRepository.listarPorNegocio(negocioId)
  const telefonoWhatsappSoporte =
    process.env.SOPORTE_WHATSAPP?.trim() || null

  return (
    <PanelSoporte
      nombreNegocio={negocio.nombre}
      plan={negocio.plan}
      telefonoWhatsappSoporte={telefonoWhatsappSoporte}
      reportesIniciales={reportes}
    />
  )
}

export default SoportePanelPage
