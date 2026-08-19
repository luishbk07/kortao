export const esCorreoValido = (correo: string): boolean => {
  const valor = correo.trim()

  if (!valor) {
    return false
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)
}

export const normalizarCorreo = (correo: string): string => {
  return correo.trim().toLowerCase()
}
