import { esProduccion } from '@/shared/utils/entorno'

const leerEnv = (clave: string): string | undefined => {
  const valor = process.env[clave]?.trim()
  return valor || undefined
}

export const obtenerCredencialesSupabase = (): {
  url: string
  anonKey: string
} => {
  // Production: prod vars only. Elsewhere: prefer _DEV, fall back to prod
  // names so local .env.local keeps working without duplicating keys.
  const url = esProduccion()
    ? leerEnv('NEXT_PUBLIC_SUPABASE_URL')
    : leerEnv('NEXT_PUBLIC_SUPABASE_URL_DEV') ??
      leerEnv('NEXT_PUBLIC_SUPABASE_URL')

  const anonKey = esProduccion()
    ? leerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    : leerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV') ??
      leerEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    throw new Error(
      esProduccion()
        ? 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
        : 'Missing NEXT_PUBLIC_SUPABASE_URL_DEV / NEXT_PUBLIC_SUPABASE_ANON_KEY_DEV (or fallback NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)'
    )
  }

  return { url, anonKey }
}
