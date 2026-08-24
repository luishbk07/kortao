import { notFound } from 'next/navigation'
import { crearObtenerDetalleNegocioAdmin } from '@/application/useCases/admin/obtenerDetalleNegocioAdmin'
import { crearAdminRepository } from '@/infrastructure/supabase/adminRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { DetalleNegocioAdminVista } from '@/presentation/components/admin/DetalleNegocioAdminVista'

type DetalleNegocioAdminPageProps = {
  params: {
    negocioId: string
  }
}

const DetalleNegocioAdminPage = async ({
  params
}: DetalleNegocioAdminPageProps) => {
  const supabase = crearClienteServidor()
  const adminRepository = crearAdminRepository(supabase)
  const obtenerDetalle = crearObtenerDetalleNegocioAdmin(adminRepository)
  const detalle = await obtenerDetalle(params.negocioId)

  if (!detalle) {
    notFound()
  }

  return <DetalleNegocioAdminVista detalle={detalle} />
}

export default DetalleNegocioAdminPage
