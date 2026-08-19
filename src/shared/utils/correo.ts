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

export const esCorreoGmail = (correo: string): boolean => {
  const normalizado = normalizarCorreo(correo)
  return (
    normalizado.endsWith('@gmail.com') ||
    normalizado.endsWith('@googlemail.com')
  )
}
