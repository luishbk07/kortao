'use server'

import { crearSupportRepository } from '@/infrastructure/supabase/supportRepository.supabase'
import { crearBusinessRepository } from '@/infrastructure/supabase/businessRepository.supabase'
import { crearAuthService } from '@/infrastructure/supabase/authService.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { enviarCorreoReporteSoporte } from '@/infrastructure/notifications/enviarCorreoReporteSoporte'

const obtenerContextoSoporte = async () => {
  const supabase = crearClienteServidor()
  const authService = crearAuthService(supabase)
  const businessRepository = crearBusinessRepository(supabase)
  const supportRepository = crearSupportRepository(supabase)

  const usuario = await authService.obtenerUsuarioActual()

  if (!usuario) {
    throw new Error('No hay una sesión activa')
  }

  const negocioId = await businessRepository.obtenerNegocioIdPorUsuario(
    usuario.id
  )

  if (!negocioId) {
    throw new Error('Tu usuario no está vinculado a un negocio')
  }

  return { businessRepository, supportRepository, negocioId }
}

export const enviarReporteSoporteAction = async (
  mensaje: string
): Promise<{
  id: string
  mensaje: string
  estado: string
  creadoEn: string
}> => {
  const { businessRepository, supportRepository, negocioId } =
    await obtenerContextoSoporte()

  const negocio = await businessRepository.obtenerNegocioPorId(negocioId)

  if (!negocio) {
    throw new Error('No se encontraron los datos del negocio')
  }

  const reporte = await supportRepository.crearReporte(negocioId, mensaje)

  try {
    await enviarCorreoReporteSoporte({
      nombreNegocio: negocio.nombre,
      mensaje: reporte.mensaje
    })
  } catch (error) {
    // Report already saved; email must not fail the action.
    console.error('No se pudo enviar el correo de soporte', error)
  }

  return {
    id: reporte.id,
    mensaje: reporte.mensaje,
    estado: reporte.estado,
    creadoEn: reporte.creadoEn.toISOString()
  }
}
