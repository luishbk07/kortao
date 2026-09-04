import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { esProduccion } from '@/shared/utils/entorno'
import { obtenerCredencialesSupabase } from './obtenerCredenciales'

/**
 * Service-role client for server-only Auth Admin reads (e.g. employee emails).
 * Returns null when the secret key is not configured.
 */
export const crearClienteServicioOpcional = (): SupabaseClient | null => {
  const { url } = obtenerCredencialesSupabase()
  const serviceRoleKey = esProduccion()
    ? process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SECRET_KEY
    : process.env.SUPABASE_SERVICE_ROLE_KEY_DEV ??
      process.env.SUPABASE_SECRET_KEY_DEV ??
      process.env.SUPABASE_SERVICE_ROLE_KEY ??
      process.env.SUPABASE_SECRET_KEY

  if (!serviceRoleKey?.trim()) {
    return null
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
