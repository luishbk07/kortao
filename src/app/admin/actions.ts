'use server'

import { crearRegistrarPago } from '@/application/useCases/admin/registrarPago'
import { crearAdminRepository } from '@/infrastructure/supabase/adminRepository.supabase'
import { crearSupportRepository } from '@/infrastructure/supabase/supportRepository.supabase'
import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'
import { formatearFechaCalendario } from '@/shared/utils/fechas'

const exigirAdminAutenticado = async () => {
  const supabase = crearClienteServidor()
  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('No hay una sesión activa')
  }

  const { data: admin } = await supabase
    .from('administradores_kortao')
    .select('auth_user_id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!admin) {
    throw new Error('No autorizado')
  }

  return supabase
}

export const actualizarSuscripcionActivaAction = async (
  negocioId: string,
  activa: boolean
): Promise<void> => {
  const supabase = await exigirAdminAutenticado()

  const { error } = await supabase
    .from('negocios')
    .update({ suscripcion_activa: activa })
    .eq('id', negocioId)

  if (error) {
    throw new Error(error.message)
  }
}

export const actualizarPrecioMensualAction = async (
  negocioId: string,
  precioMensual: number | null
): Promise<void> => {
  const supabase = await exigirAdminAutenticado()

  if (
    precioMensual !== null &&
    (!Number.isFinite(precioMensual) || precioMensual < 0)
  ) {
    throw new Error('El precio mensual no es válido')
  }

  const { error } = await supabase
    .from('negocios')
    .update({ precio_mensual: precioMensual })
    .eq('id', negocioId)

  if (error) {
    throw new Error(error.message)
  }
}

const PLANES_PERMITIDOS = ['estandar', 'premium'] as const

export const actualizarPlanAction = async (
  negocioId: string,
  plan: string,
  planAnterior: string
): Promise<void> => {
  const supabase = await exigirAdminAutenticado()

  if (!PLANES_PERMITIDOS.includes(plan as (typeof PLANES_PERMITIDOS)[number])) {
    throw new Error('El plan no es válido')
  }

  const actualizacion: {
    plan: string
    fecha_inicio_suscripcion?: string
  } = { plan }

  if (planAnterior === 'estandar' && plan === 'premium') {
    actualizacion.fecha_inicio_suscripcion = new Date().toISOString()
  }

  const { error } = await supabase
    .from('negocios')
    .update(actualizacion)
    .eq('id', negocioId)

  if (error) {
    throw new Error(error.message)
  }
}

export const registrarPagoAction = async (
  negocioId: string,
  monto: number
): Promise<{ id: string; fechaPago: string; monto: number }> => {
  const supabase = await exigirAdminAutenticado()
  const adminRepository = crearAdminRepository(supabase)
  const registrarPago = crearRegistrarPago(adminRepository)
  const pago = await registrarPago(negocioId, monto)

  return {
    id: pago.id,
    fechaPago: formatearFechaCalendario(pago.fechaPago),
    monto: pago.monto
  }
}

export const actualizarEstadoReporteSoporteAction = async (
  reporteId: string,
  estado: 'pendiente' | 'resuelto'
): Promise<{
  id: string
  negocioId: string
  negocioNombre: string
  mensaje: string
  estado: 'pendiente' | 'resuelto'
  creadoEn: string
}> => {
  if (estado !== 'pendiente' && estado !== 'resuelto') {
    throw new Error('El estado del reporte no es válido')
  }

  const supabase = await exigirAdminAutenticado()
  const supportRepository = crearSupportRepository(supabase)
  const reporte = await supportRepository.actualizarEstado(reporteId, estado)

  return {
    id: reporte.id,
    negocioId: reporte.negocioId,
    negocioNombre: reporte.negocioNombre,
    mensaje: reporte.mensaje,
    estado: reporte.estado,
    creadoEn: reporte.creadoEn.toISOString()
  }
}
