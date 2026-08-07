import { createBrowserClient } from '@supabase/ssr'
import { obtenerCredencialesSupabase } from './obtenerCredenciales'

export const crearClienteNavegador = () => {
  const { url, anonKey } = obtenerCredencialesSupabase()
  return createBrowserClient(url, anonKey)
}
