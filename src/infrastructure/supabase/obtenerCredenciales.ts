import { esProduccion } from '@/shared/utils/entorno'

export const obtenerCredencialesSupabase = (): {
  url: string
  anonKey: string
} => {
  const url = esProduccion()
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.NEXT_PUBLIC_SUPABASE_URL_DEV ??
      process.env.NEXT_PUBLIC_SUPABASE_URL

  const anonKey = esProduccion()
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Faltan las credenciales de Supabase para este entorno')
  }

  return { url, anonKey }
}
