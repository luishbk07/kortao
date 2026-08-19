const BUCKET_LOGOS = 'logos-negocios'
const TAMANO_MAXIMO_BYTES = 2 * 1024 * 1024

const MIME_A_EXTENSION: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp'
}

export const esTipoLogoPermitido = (tipoMime: string): boolean => {
  return Boolean(MIME_A_EXTENSION[tipoMime])
}

export const obtenerExtensionLogo = (tipoMime: string): string | null => {
  return MIME_A_EXTENSION[tipoMime] ?? null
}

export const esTamanoLogoValido = (tamanoBytes: number): boolean => {
  return tamanoBytes > 0 && tamanoBytes <= TAMANO_MAXIMO_BYTES
}

export const construirRutaLogoNegocio = (
  negocioId: string,
  extension: string
): string => {
  return `${negocioId}/logo.${extension}`
}

export { BUCKET_LOGOS, TAMANO_MAXIMO_BYTES }
