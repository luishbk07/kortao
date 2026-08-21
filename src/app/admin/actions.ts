'use server'

import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

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
