const soloDigitos = (valor: string): string => {
  return valor.replace(/\D/g, '')
}

/** Stores value as 1XXXXXXXXXX (max 11 digits). */
export const normalizarTelefonoValor = (entrada: string): string => {
  const digitos = soloDigitos(entrada)

  if (!digitos) {
    return ''
  }

  const conCodigoPais = digitos.startsWith('1') ? digitos : `1${digitos}`

  return conCodigoPais.slice(0, 11)
}

/** Visual mask: +1(XXX) XXX-XXXX */
export const formatearTelefonoVisual = (valor: string): string => {
  const digitos = soloDigitos(valor)

  if (!digitos) {
    return ''
  }

  const nacional = digitos.startsWith('1')
    ? digitos.slice(1, 11)
    : digitos.slice(0, 10)

  if (nacional.length === 0) {
    return '+1'
  }

  if (nacional.length <= 3) {
    return `+1(${nacional}`
  }

  if (nacional.length <= 6) {
    return `+1(${nacional.slice(0, 3)}) ${nacional.slice(3)}`
  }

  return `+1(${nacional.slice(0, 3)}) ${nacional.slice(3, 6)}-${nacional.slice(6, 10)}`
}

export const esTelefonoCompleto = (valor: string): boolean => {
  const normalizado = normalizarTelefonoValor(valor)
  return normalizado.length === 11 && normalizado.startsWith('1')
}

export const construirEnlaceWhatsapp = (telefono: string): string => {
  const digitos = soloDigitos(telefono)
  return `https://wa.me/${digitos}`
}

export const construirEnlaceTelefono = (telefono: string): string => {
  const digitos = soloDigitos(telefono)
  return digitos ? `tel:+${digitos}` : 'tel:'
}
