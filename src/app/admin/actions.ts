'use server'

import { crearClienteServidor } from '@/infrastructure/supabase/clienteServidor'

export const actualizarSuscripcionActivaAction = async (
  negocioId: string,
  activa: boolean
): Promise<void> => {
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

  const { error } = await supabase
    .from('negocios')
    .update({ suscripcion_activa: activa })
    .eq('id', negocioId)

  if (error) {
    throw new Error(error.message)
  }
}
