const CARACTERES = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export const generarCodigoInvitacion = (longitud = 8): string => {
  let codigo = ''

  for (let indice = 0; indice < longitud; indice += 1) {
    const posicion = Math.floor(Math.random() * CARACTERES.length)
    codigo += CARACTERES[posicion]
  }

  return codigo
}
