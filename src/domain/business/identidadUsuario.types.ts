export type TipoDocumentoUsuario = 'cedula' | 'rnc' | 'pasaporte'

export type DatosIdentidadUsuario = {
  nombre: string
  tipoDocumento: TipoDocumentoUsuario
  numeroDocumento: string
  telefono: string
}

export const etiquetaTipoDocumento = (
  tipo: TipoDocumentoUsuario
): string => {
  if (tipo === 'rnc') {
    return 'RNC'
  }

  if (tipo === 'pasaporte') {
    return 'Pasaporte'
  }

  return 'Cédula'
}

export const normalizarNumeroDocumento = (
  valor: string,
  tipo: TipoDocumentoUsuario = 'cedula'
): string => {
  if (tipo === 'pasaporte') {
    return valor.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
  }

  return valor.replace(/\D/g, '')
}

export const esTipoDocumentoUsuario = (
  valor: string
): valor is TipoDocumentoUsuario => {
  return valor === 'cedula' || valor === 'rnc' || valor === 'pasaporte'
}

export const esNumeroDocumentoValido = (
  tipo: TipoDocumentoUsuario,
  numero: string
): boolean => {
  const normalizado = normalizarNumeroDocumento(numero, tipo)

  if (tipo === 'cedula') {
    return normalizado.length === 11
  }

  if (tipo === 'rnc') {
    return normalizado.length === 9 || normalizado.length === 11
  }

  return normalizado.length >= 6 && normalizado.length <= 20
}

export const esIdentidadUsuarioValida = (
  datos: DatosIdentidadUsuario
): boolean => {
  return (
    datos.nombre.trim().length > 1 &&
    esTipoDocumentoUsuario(datos.tipoDocumento) &&
    esNumeroDocumentoValido(datos.tipoDocumento, datos.numeroDocumento) &&
    datos.telefono.replace(/\D/g, '').length >= 10
  )
}
