export const esProduccion = (): boolean => {
  return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production'
}
